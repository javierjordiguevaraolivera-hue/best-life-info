import { geolocation, ipAddress, waitUntil } from "@vercel/functions";
import { NextResponse } from "next/server";

type LeadPayload = {
  page?: string;
  answers?: Record<string, unknown>;
  meta?: {
    deviceId?: string;
  };
};

type PhoneValidationResult = {
  isValid: boolean;
  normalized: string;
  flags: string[];
  reason?: string;
  details?: {
    e164?: string;
    carrier?: string;
    phoneType?: string;
    phoneRegion?: string;
    country?: string;
    countryCode?: string;
  };
};

type VeriphoneResponse = {
  status?: string;
  phone_valid?: boolean;
  phone_type?: string;
  phone_region?: string;
  country?: string;
  country_code?: string;
  e164?: string;
  carrier?: string;
};

async function postWebhook(url: string, payload: unknown) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

const PHONE_WINDOW_MS = 6 * 60 * 60 * 1000;
const VELOCITY_WINDOW_MS = 30 * 60 * 1000;
const VERIPHONE_TIMEOUT_MS = 3500;
const phoneAttempts = new Map<string, number[]>();
const ipAttempts = new Map<string, number[]>();
const deviceAttempts = new Map<string, number[]>();

function pruneAndCount(store: Map<string, number[]>, key: string, windowMs: number, now: number) {
  const recent = (store.get(key) || []).filter((timestamp) => now - timestamp <= windowMs);
  recent.push(now);
  store.set(key, recent);
  return recent.length;
}

function normalizeUsPhone(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

async function validateUsPhone(value: unknown): Promise<PhoneValidationResult> {
  const normalized = normalizeUsPhone(value);

  if (normalized.length !== 10) {
    return {
      isValid: false,
      normalized,
      flags: ["invalid_length"],
      reason: "Ingresa un numero valido de EE.UU. con 10 digitos.",
    };
  }

  const apiKey = process.env.VERIPHONE_API_KEY?.trim();
  if (!apiKey) {
    return {
      isValid: false,
      normalized,
      flags: ["veriphone_missing_key"],
      reason: "No pudimos validar el numero ahora mismo. Intenta nuevamente.",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), VERIPHONE_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.veriphone.io/v2/verify?${new URLSearchParams({
        key: apiKey,
        phone: `+1${normalized}`,
      })}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return {
        isValid: false,
        normalized,
        flags: [`veriphone_http_${response.status}`],
        reason: "No pudimos validar el numero ahora mismo. Intenta nuevamente.",
      };
    }

    const data = (await response.json()) as VeriphoneResponse;
    const isValid = data.status === "success" && data.phone_valid === true;

    return {
      isValid,
      normalized,
      flags: isValid ? [] : ["veriphone_invalid_phone"],
      reason: isValid ? undefined : "Ingresa un numero real y activo de EE.UU.",
      details: {
        e164: data.e164,
        carrier: data.carrier,
        phoneType: data.phone_type,
        phoneRegion: data.phone_region,
        country: data.country,
        countryCode: data.country_code,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      normalized,
      flags: [(error as Error).name === "AbortError" ? "veriphone_timeout" : "veriphone_error"],
      reason: "No pudimos validar el numero ahora mismo. Intenta nuevamente.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LeadPayload | null;

  if (!body?.answers) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const webhookUrl = process.env.IUL_V4?.trim();
  const backupWebhookUrl = process.env.WBK_TEST_URL2?.trim() || process.env.TEST_WEBHOOK_URL_ONLY?.trim();
  const geo = geolocation(request);
  const requestIp =
    ipAddress(request) ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const phoneValidation = await validateUsPhone(body.answers.phoneNumber);
  const deviceId = String(body.meta?.deviceId || "").trim();
  const now = Date.now();
  const duplicatePhoneCount = phoneValidation.normalized
    ? pruneAndCount(phoneAttempts, phoneValidation.normalized, PHONE_WINDOW_MS, now)
    : 0;
  const ipVelocityCount = requestIp !== "unknown"
    ? pruneAndCount(ipAttempts, requestIp, VELOCITY_WINDOW_MS, now)
    : 0;
  const deviceVelocityCount = deviceId
    ? pruneAndCount(deviceAttempts, deviceId, VELOCITY_WINDOW_MS, now)
    : 0;
  const cleanedAnswers = Object.fromEntries(
    Object.entries(body.answers).filter(([, value]) => value !== "" && value != null)
  );
  const riskFlags = [
    ...phoneValidation.flags,
    ...(duplicatePhoneCount >= 3 ? ["duplicate_phone"] : []),
    ...(ipVelocityCount >= 6 ? ["high_velocity_ip"] : []),
    ...(deviceVelocityCount >= 4 ? ["high_velocity_device"] : []),
  ];

  if (!phoneValidation.isValid) {
    return NextResponse.json(
      {
        error: phoneValidation.reason || "Ingresa un numero valido de EE.UU.",
        riskFlags,
      },
      { status: 422 }
    );
  }

  const { phoneNumber: _ignoredPhone, ...restAnswers } = cleanedAnswers;
  const payload = {
    submittedAt: new Date().toISOString(),
    source: "best-money-next",
    pagina: body.page || "home",
    ipAddress: requestIp,
    geolocation: geo,
    ...restAnswers,
    phoneNumber: phoneValidation.normalized,
    validation: {
      phoneCountry: "US",
      phoneProvider: "veriphone",
      phoneE164: phoneValidation.details?.e164,
      phoneType: phoneValidation.details?.phoneType,
      phoneRegion: phoneValidation.details?.phoneRegion,
      phoneCarrier: phoneValidation.details?.carrier,
      duplicatePhoneCount,
      ipVelocityCount,
      deviceVelocityCount,
      flags: riskFlags,
    },
  };

  if (!webhookUrl) {
    return NextResponse.json({
      ok: true,
      forwarded: false,
      saved: true,
      payload,
    });
  }

  try {
    if (backupWebhookUrl && backupWebhookUrl !== webhookUrl) {
      waitUntil(
        postWebhook(backupWebhookUrl, payload).then((backupResponse) => {
          if (!backupResponse.ok) {
            throw new Error(`Backup webhook rejected payload with ${backupResponse.status}`);
          }
        }).catch((error) => {
          console.error("Backup webhook failed", error);
        })
      );
    }

    const response = await postWebhook(webhookUrl, payload);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Webhook rejected payload" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      forwarded: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Webhook request failed" },
      { status: 502 }
    );
  }
}
