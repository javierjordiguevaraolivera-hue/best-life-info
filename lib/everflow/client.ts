import {
  everflowDirectLinkOfferId,
  everflowLandingReferrer,
  everflowTrackingDomain,
  everflowTransactionStorageKey,
} from "@/lib/everflow/config";
import {
  buildEverflowBrowserSignature,
  getNestedTransactionId,
  getTrimmedParam,
} from "@/lib/everflow/attribution";
import type {
  EverflowClientClickResult,
  EverflowClickSource,
  EverflowStoredTransaction,
} from "@/lib/everflow/types";

type EverflowSdk = {
  configure?: (options: { tracking_domain?: string; tld?: string }) => void;
  click: (payload: Record<string, string | Record<string, string> | undefined>) => unknown;
  getTransactionId?: (offerId: string | number) => string | undefined;
};

let everflowSdkPromise: Promise<EverflowSdk> | null = null;

function getStorageCandidates() {
  if (typeof window === "undefined") return [];
  return [window.sessionStorage, window.localStorage];
}

function parseStoredTransaction(value: string | null): EverflowStoredTransaction | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<EverflowStoredTransaction>;
    if (
      typeof parsed.transactionId === "string" &&
      parsed.transactionId.trim() &&
      typeof parsed.signature === "string"
    ) {
      return {
        transactionId: parsed.transactionId.trim(),
        signature: parsed.signature,
        source: parsed.source === "server" || parsed.source === "sdk" || parsed.source === "stored" || parsed.source === "url"
          ? parsed.source
          : "stored",
        createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : "",
      };
    }
  } catch {
    // Old deployments stored the raw transaction ID here. Ignore it because it
    // has no click signature and can be reused across unrelated leads.
  }

  return null;
}

export function readStoredEverflowTransaction(signature: string) {
  try {
    for (const storage of getStorageCandidates()) {
      const stored = parseStoredTransaction(storage.getItem(everflowTransactionStorageKey));
      if (stored?.signature === signature) return stored;
    }
  } catch {
    // Storage can be blocked in privacy modes; the lead can still submit.
  }

  return null;
}

export function storeEverflowTransaction(
  transactionId: string,
  signature: string,
  source: Exclude<EverflowClickSource, "missing">,
) {
  if (typeof window === "undefined" || !transactionId || !signature) return;

  const payload: EverflowStoredTransaction = {
    transactionId,
    signature,
    source,
    createdAt: new Date().toISOString(),
  };

  try {
    const serialized = JSON.stringify(payload);
    for (const storage of getStorageCandidates()) {
      storage.setItem(everflowTransactionStorageKey, serialized);
    }
  } catch {
    // Storage is diagnostic/convenience only; submit should never be blocked.
  }
}

export function readUrlEverflowTransaction(searchParams: URLSearchParams) {
  const transactionId = getTrimmedParam(searchParams, "_ef_transaction_id");
  if (!transactionId) return null;

  return {
    transactionId,
    source: "url" as const,
    key: "_ef_transaction_id",
  };
}

export function getReusableEverflowTransaction(searchParams: URLSearchParams) {
  const signature = buildEverflowBrowserSignature(searchParams);
  const urlTransaction = readUrlEverflowTransaction(searchParams);
  if (urlTransaction) return { ...urlTransaction, signature };

  const storedTransaction = readStoredEverflowTransaction(signature);
  if (storedTransaction) {
    return {
      transactionId: storedTransaction.transactionId,
      source: storedTransaction.source,
      key: everflowTransactionStorageKey,
      signature,
    };
  }

  return null;
}

export function loadEverflowSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Everflow SDK can only load in the browser"));
  }

  if (everflowSdkPromise) return everflowSdkPromise;

  everflowSdkPromise = import("@everflow/everflow-sdk").then((module) => {
    const sdk = module.default as EverflowSdk;
    if (!sdk?.click) {
      throw new Error("Everflow SDK loaded without click()");
    }

    // Official npm SDK setup. The tracking domain is the Everflow custom domain.
    sdk.configure?.({ tracking_domain: everflowTrackingDomain });
    return sdk;
  });

  return everflowSdkPromise;
}

export async function requestEverflowClientClick(
  searchParams: URLSearchParams,
): Promise<EverflowClientClickResult> {
  const signature = buildEverflowBrowserSignature(searchParams);
  const reusable = getReusableEverflowTransaction(searchParams);
  if (reusable?.transactionId) {
    return {
      attempted: false,
      status: "skipped",
      transactionId: reusable.transactionId,
      source: reusable.source,
      signature,
    };
  }

  try {
    const sdk = await loadEverflowSdk();
    const clickResult = await Promise.resolve(
      sdk.click({
        offer_id: everflowDirectLinkOfferId,
        affiliate_id: getTrimmedParam(searchParams, "affid"),
        source_id: getTrimmedParam(searchParams, "source_id") || undefined,
        sub1: getTrimmedParam(searchParams, "sub1") || undefined,
        sub2: getTrimmedParam(searchParams, "sub2") || undefined,
        sub3: getTrimmedParam(searchParams, "sub3") || undefined,
        sub4: getTrimmedParam(searchParams, "sub4") || undefined,
        sub5: getTrimmedParam(searchParams, "sub5") || undefined,
        uid: getTrimmedParam(searchParams, "uid") || undefined,
        transaction_id: getTrimmedParam(searchParams, "_ef_transaction_id") || undefined,
        // Force the same clean referrer in every Everflow browser click. Do not
        // send the full URL here; campaign params already travel as explicit fields.
        parameters: {
          __rf: everflowLandingReferrer,
        },
      }),
    );
    // Only trust the current click response. `getTransactionId()` can read an
    // older Everflow cookie, which is exactly what can duplicate sub2 across leads.
    const transactionId = getNestedTransactionId(clickResult);

    if (transactionId) {
      storeEverflowTransaction(transactionId, signature, "sdk");
      return {
        attempted: true,
        status: "success",
        transactionId,
        source: "sdk",
        signature,
      };
    }

    return {
      attempted: true,
      status: "missing_transaction_id",
      transactionId: null,
      source: "missing",
      signature,
    };
  } catch (error) {
    return {
      attempted: true,
      status: "failed",
      transactionId: null,
      source: "missing",
      error: error instanceof Error ? error.message : String(error),
      signature,
    };
  }
}
