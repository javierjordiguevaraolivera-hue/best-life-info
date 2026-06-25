import {
  everflowDirectLinkOfferId,
  everflowLandingReferrer,
  everflowServerTimeoutMs,
  everflowTrackingDomain,
} from "@/lib/everflow/config";
import {
  buildEverflowServerSignature,
  getSearchParam,
  hasEverflowDirectLinkParams,
  normalizeTransactionId,
  type EverflowSearchParams,
} from "@/lib/everflow/attribution";
import type { EverflowServerClickResult } from "@/lib/everflow/types";

type EverflowServerClickContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

type EverflowClickResponse = {
  transaction_id?: unknown;
  oid?: unknown;
  aid?: unknown;
  error?: unknown;
};

function appendIfPresent(params: URLSearchParams, source: EverflowSearchParams, key: string) {
  const value = getSearchParam(source, key);
  if (value) params.set(key, value);
}

function buildRequestSnapshot(searchParams: EverflowSearchParams) {
  return {
    oid: getSearchParam(searchParams, "oid") || undefined,
    affid: getSearchParam(searchParams, "affid") || undefined,
    sourceId: getSearchParam(searchParams, "source_id") || undefined,
    hasFbclid: Boolean(getSearchParam(searchParams, "fbclid")),
    hasTtclid: Boolean(getSearchParam(searchParams, "ttclid")),
    hasGclid: Boolean(getSearchParam(searchParams, "gclid")),
    urlSub1: getSearchParam(searchParams, "sub1") || undefined,
    urlSub2: getSearchParam(searchParams, "sub2") || undefined,
    referrer: everflowLandingReferrer,
    signature: buildEverflowServerSignature(searchParams),
  };
}

function emptyServerResult(
  searchParams: EverflowSearchParams,
  status: EverflowServerClickResult["status"],
  overrides: Partial<EverflowServerClickResult> = {},
): EverflowServerClickResult {
  return {
    attempted: status !== "skipped",
    directLink: hasEverflowDirectLinkParams(searchParams),
    endpoint: null,
    status,
    transactionId: null,
    request: buildRequestSnapshot(searchParams),
    ...overrides,
  };
}

export async function requestEverflowServerClick(
  searchParams: EverflowSearchParams,
  context: EverflowServerClickContext = {},
): Promise<EverflowServerClickResult> {
  if (!hasEverflowDirectLinkParams(searchParams)) {
    return emptyServerResult(searchParams, "skipped", { attempted: false });
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), everflowServerTimeoutMs);
  const clickUrl = new URL("/sdk/click", everflowTrackingDomain);
  const clickParams = clickUrl.searchParams;

  // Server-side Direct Linking fallback. This mirrors the official browser SDK
  // endpoint, but runs from Vercel so browser tracking blockers cannot prevent it.
  clickParams.set("_ef_transaction_id", getSearchParam(searchParams, "_ef_transaction_id"));
  clickParams.set("oid", getSearchParam(searchParams, "oid") || everflowDirectLinkOfferId);
  clickParams.set("affid", getSearchParam(searchParams, "affid"));
  clickParams.set("__cc", getSearchParam(searchParams, "__cc"));
  clickParams.set("async", "json");
  clickParams.set("__rf", everflowLandingReferrer);

  [
    "uid",
    "source_id",
    "creative_id",
    "cost",
    "fbclid",
    "gclid",
    "ttclid",
    "sccid",
    "sub1",
    "sub2",
    "sub3",
    "sub4",
    "sub5",
    "sub6",
    "sub7",
    "sub8",
    "sub9",
    "sub10",
    "adv1",
    "adv2",
    "adv3",
    "adv4",
    "adv5",
    "adv6",
    "adv7",
    "adv8",
    "adv9",
    "adv10",
  ].forEach((key) => appendIfPresent(clickParams, searchParams, key));

  try {
    const response = await fetch(clickUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(context.userAgent ? { "User-Agent": context.userAgent } : {}),
        ...(context.ipAddress ? { "X-Forwarded-For": context.ipAddress } : {}),
        Referer: everflowLandingReferrer,
      },
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => null)) as EverflowClickResponse | null;
    const transactionId = normalizeTransactionId(body?.transaction_id);
    const result: EverflowServerClickResult = {
      attempted: true,
      directLink: true,
      endpoint: `${everflowTrackingDomain}/sdk/click`,
      status: transactionId ? "success" : "missing_transaction_id",
      transactionId,
      durationMs: Date.now() - startedAt,
      httpStatus: response.status,
      response: body ? (body as Record<string, unknown>) : null,
      request: buildRequestSnapshot(searchParams),
    };

    if (!response.ok) {
      console.error("Everflow server click failed", {
        ...result,
        status: "failed",
        error: `HTTP ${response.status}`,
      });
      return { ...result, status: "failed", error: `HTTP ${response.status}` };
    }

    if (!transactionId) {
      console.error("Everflow server click missing transaction_id", result);
    }

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = error instanceof Error && error.name === "AbortError" ? "failed" : "failed";
    const result = emptyServerResult(searchParams, status, {
      attempted: true,
      directLink: true,
      endpoint: `${everflowTrackingDomain}/sdk/click`,
      durationMs: Date.now() - startedAt,
      error: message,
    });

    console.error("Everflow server click request failed", result);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}
