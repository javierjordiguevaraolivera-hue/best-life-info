import { everflowClickSignatureKeys } from "@/lib/everflow/config";
import type { EverflowClickSource, TrafficAttribution } from "@/lib/everflow/types";

export type EverflowSearchParams = Record<string, string | string[] | undefined>;

export function getSearchParam(searchParams: EverflowSearchParams, key: string) {
  const value = searchParams[key];
  const firstValue = Array.isArray(value) ? value[0] : value;
  return typeof firstValue === "string" ? firstValue.trim() : "";
}

export function getTrimmedParam(searchParams: URLSearchParams, name: string) {
  return searchParams.get(name)?.trim() || "";
}

export function hasEverflowDirectLinkParams(searchParams: EverflowSearchParams) {
  return Boolean(getSearchParam(searchParams, "oid") && getSearchParam(searchParams, "affid"));
}

export function isEverflowDirectLink(searchParams: URLSearchParams) {
  return Boolean(getTrimmedParam(searchParams, "oid") && getTrimmedParam(searchParams, "affid"));
}

export function buildEverflowServerSignature(searchParams: EverflowSearchParams) {
  return everflowClickSignatureKeys
    .map((key) => `${key}=${encodeURIComponent(getSearchParam(searchParams, key))}`)
    .join("&");
}

export function buildEverflowBrowserSignature(searchParams: URLSearchParams) {
  return everflowClickSignatureKeys
    .map((key) => `${key}=${encodeURIComponent(getTrimmedParam(searchParams, key))}`)
    .join("&");
}

export function normalizeTransactionId(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getNestedTransactionId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const directValue =
    record.transaction_id ||
    record.transactionId ||
    record.transactionIdValue ||
    record.tid ||
    record.id;

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue.trim();
  }

  return getNestedTransactionId(record.data) || getNestedTransactionId(record.response);
}

export function resolveTrafficAttribution(
  searchParams: URLSearchParams,
  everflowTransactionId?: string | null,
): TrafficAttribution {
  const uniqueParamNames = Array.from(new Set(searchParams.keys()));
  const sub1 = getTrimmedParam(searchParams, "sub1");
  const sub2 = getTrimmedParam(searchParams, "sub2");
  const affid = getTrimmedParam(searchParams, "affid");
  const adaccountName = getTrimmedParam(searchParams, "adaccount_name") || null;
  const isStrictEverflowRedirect =
    uniqueParamNames.length === 2 &&
    uniqueParamNames.every((name) => name === "sub1" || name === "sub2") &&
    !!sub1 &&
    !!sub2;

  // Redirect tracking arrives with only sub1/sub2, so those values are already final.
  if (isStrictEverflowRedirect) {
    return {
      source: "network",
      sub1,
      sub2,
      adaccountName: null,
    };
  }

  // Direct Linking arrives with oid/affid. We store affid as sub1 and Everflow TID as sub2.
  if (isEverflowDirectLink(searchParams)) {
    return {
      source: "network",
      sub1: affid,
      sub2: everflowTransactionId || null,
      adaccountName,
    };
  }

  // Everything else, including no params, is internal traffic by business rule.
  return {
    source: "internal",
    sub1: null,
    sub2: null,
    adaccountName,
  };
}

export function getFinalEverflowSource(
  transactionId: string | null | undefined,
  source: EverflowClickSource | null | undefined,
): EverflowClickSource {
  return transactionId ? source || "missing" : "missing";
}
