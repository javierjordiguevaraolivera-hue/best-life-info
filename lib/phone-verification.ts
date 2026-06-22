import { createHmac, timingSafeEqual } from "crypto";

export type VeriphoneResponse = {
  status?: string;
  phone?: string;
  phone_valid?: boolean;
  phone_type?: string;
  phone_region?: string;
  country?: string;
  country_code?: string;
  country_prefix?: string;
  international_number?: string;
  local_number?: string;
  e164?: string;
  carrier?: string;
  code?: number;
  type?: string;
  message?: string;
};

export type PhoneVerificationResult = {
  isValid: boolean;
  normalized: string;
  reason?: string;
  flags: string[];
  veriphone?: VeriphoneResponse;
};

type PhoneVerificationTokenPayload = {
  normalized: string;
  issuedAt: number;
  expiresAt: number;
};

const phoneVerificationTokenTtlMs = 15 * 60 * 1000;

function getPhoneVerificationSecret() {
  return process.env.VERIPHONE_API_KEY?.trim() || "";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPhoneVerificationPayload(payload: string) {
  const secret = getPhoneVerificationSecret();
  if (!secret || secret === "YOUR_API_KEY") return "";

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function normalizeUsPhone(value: unknown) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.slice(0, 10);
}

export function getPhoneLengthMessage(value: unknown) {
  return normalizeUsPhone(value).length === 10
    ? ""
    : "Ingresa un numero contactable de 10 digitos.";
}

function isAllowedVeriphonePhoneType(value: unknown) {
  const phoneType = String(value || "").trim().toLowerCase();
  return phoneType === "mobile" || phoneType === "fixed_line" || phoneType === "fixed_line_or_mobile";
}

export function isVeriphoneAllowedPhoneResult(data: VeriphoneResponse) {
  const carrier = String(data.carrier || "").trim().toLowerCase();
  const countryCode = String(data.country_code || "").trim().toUpperCase();
  const country = String(data.country || "").trim().toLowerCase();

  return (
    data.phone_valid === true &&
    isAllowedVeriphonePhoneType(data.phone_type) &&
    !!carrier &&
    carrier !== "unknown" &&
    (countryCode === "US" || country === "united states")
  );
}

export function createPhoneVerificationToken(normalized: string) {
  const now = Date.now();
  const payload: PhoneVerificationTokenPayload = {
    normalized,
    issuedAt: now,
    expiresAt: now + phoneVerificationTokenTtlMs,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPhoneVerificationPayload(encodedPayload);

  return signature ? `${encodedPayload}.${signature}` : "";
}

export function verifyPhoneVerificationToken(token: unknown, expectedPhone: string) {
  const value = String(token || "").trim();
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) return false;

  const expectedSignature = signPhoneVerificationPayload(encodedPayload);
  if (!expectedSignature) return false;

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as PhoneVerificationTokenPayload;
    return payload.normalized === expectedPhone && payload.expiresAt >= Date.now();
  } catch {
    return false;
  }
}

export async function verifyPhoneWithVeriphone(value: unknown): Promise<PhoneVerificationResult> {
  const normalized = normalizeUsPhone(value);

  if (normalized.length !== 10) {
    return {
      isValid: false,
      normalized,
      reason: "Ingresa un numero contactable de 10 digitos.",
      flags: ["invalid_length"],
    };
  }

  const apiKey = process.env.VERIPHONE_API_KEY?.trim();

  if (!apiKey || apiKey === "YOUR_API_KEY") {
    return {
      isValid: false,
      normalized,
      reason: "Phone verification is not configured.",
      flags: ["veriphone_not_configured"],
    };
  }

  const response = await fetch(
    `https://api.veriphone.io/v2/verify?phone=${encodeURIComponent(`+1${normalized}`)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    },
  );
  const data = (await response.json().catch(() => null)) as VeriphoneResponse | null;

  if (!response.ok || !data) {
    return {
      isValid: false,
      normalized,
      reason: data?.message || "No pudimos verificar el numero ahora mismo.",
      flags: ["veriphone_request_failed"],
      veriphone: data || undefined,
    };
  }

  const isValid = isVeriphoneAllowedPhoneResult(data);
  const countryCode = String(data.country_code || "").trim().toUpperCase();
  const country = String(data.country || "").trim().toLowerCase();
  const flags = [
    ...(data.phone_valid === true ? [] : ["veriphone_invalid_phone"]),
    ...(isAllowedVeriphonePhoneType(data.phone_type) ? [] : ["veriphone_disallowed_phone_type"]),
    ...(
      String(data.carrier || "").trim() &&
      String(data.carrier || "").trim().toLowerCase() !== "unknown"
        ? []
        : ["veriphone_unknown_carrier"]
    ),
    ...(countryCode === "US" || country === "united states" ? [] : ["veriphone_not_us"]),
  ];

  return {
    isValid,
    normalized,
    reason: isValid ? undefined : "Ingresa un numero movil contactable.",
    flags,
    veriphone: data,
  };
}
