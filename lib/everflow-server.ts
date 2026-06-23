type EverflowSearchParams = Record<string, string | string[] | undefined>;

type EverflowServerClickContext = {
  referrer?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
};

type EverflowClickResponse = {
  transaction_id?: unknown;
  oid?: unknown;
  aid?: unknown;
  error?: unknown;
};

const everflowTrackingDomain = "https://www.jk8gcxs.com";
const everflowDirectLinkOfferId = "3765";
const everflowServerTimeoutMs = 1800;

function getSearchParam(searchParams: EverflowSearchParams, key: string) {
  const value = searchParams[key];
  const firstValue = Array.isArray(value) ? value[0] : value;
  return typeof firstValue === "string" ? firstValue.trim() : "";
}

function hasEverflowDirectLinkParams(searchParams: EverflowSearchParams) {
  return Boolean(getSearchParam(searchParams, "oid") && getSearchParam(searchParams, "affid"));
}

function appendIfPresent(params: URLSearchParams, source: EverflowSearchParams, key: string) {
  const value = getSearchParam(source, key);
  if (value) params.set(key, value);
}

function getQueryKeys(searchParams: EverflowSearchParams) {
  return Object.keys(searchParams).filter((key) => getSearchParam(searchParams, key));
}

function normalizeTransactionId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function requestEverflowServerClick(
  searchParams: EverflowSearchParams,
  context: EverflowServerClickContext = {},
) {
  if (!hasEverflowDirectLinkParams(searchParams)) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), everflowServerTimeoutMs);
  const clickUrl = new URL("/clk", everflowTrackingDomain);
  const clickParams = clickUrl.searchParams;

  // Server-side Everflow Direct Linking. Everflow documents `/clk` as the
  // backend endpoint that records a click and returns a transaction_id.
  clickParams.set("oid", getSearchParam(searchParams, "oid") || everflowDirectLinkOfferId);
  clickParams.set("affid", getSearchParam(searchParams, "affid"));
  appendIfPresent(clickParams, searchParams, "_ef_transaction_id");
  appendIfPresent(clickParams, searchParams, "__cc");
  if (getQueryKeys(searchParams).length) {
    clickParams.set("__qp", getQueryKeys(searchParams).join("|"));
  }
  if (context.referrer) {
    clickParams.set("__rf", context.referrer);
  }

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
        ...(context.referrer ? { Referer: context.referrer } : {}),
        ...(context.ipAddress ? { "X-Forwarded-For": context.ipAddress } : {}),
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("Everflow server click failed", response.status);
      return null;
    }

    const body = (await response.json().catch(() => null)) as EverflowClickResponse | null;
    const transactionId = normalizeTransactionId(body?.transaction_id);

    if (!transactionId) {
      console.error("Everflow server click missing transaction_id", body);
      return null;
    }

    return transactionId;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Everflow server click timed out");
      return null;
    }

    console.error("Everflow server click request failed", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}
