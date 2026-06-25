export type TrafficSource = "network" | "internal";

export type TrafficAttribution = {
  source: TrafficSource;
  sub1: string | null;
  sub2: string | null;
  adaccountName: string | null;
};

export type EverflowClickSource = "server" | "sdk" | "stored" | "url" | "missing";

export type EverflowStoredTransaction = {
  transactionId: string;
  signature: string;
  source: Exclude<EverflowClickSource, "missing">;
  createdAt: string;
};

export type EverflowServerClickResult = {
  attempted: boolean;
  directLink: boolean;
  endpoint: string | null;
  status: "success" | "missing_transaction_id" | "failed" | "skipped";
  transactionId: string | null;
  durationMs?: number;
  httpStatus?: number;
  error?: string;
  response?: Record<string, unknown> | null;
  request: {
    oid?: string;
    affid?: string;
    sourceId?: string;
    hasFbclid: boolean;
    hasTtclid: boolean;
    hasGclid: boolean;
    urlSub1?: string;
    urlSub2?: string;
    referrer: string;
    signature: string;
  };
};

export type EverflowClientClickResult = {
  attempted: boolean;
  status: "success" | "missing_transaction_id" | "failed" | "skipped";
  transactionId: string | null;
  source: "server" | "sdk" | "stored" | "url" | "missing";
  error?: string;
  signature: string;
};

export type EverflowDiagnostics = {
  directLink: boolean;
  signature: string;
  server?: EverflowServerClickResult | null;
  client?: EverflowClientClickResult | null;
  final?: {
    source: EverflowClickSource;
    sub1: string | null;
    sub2: string | null;
  };
};
