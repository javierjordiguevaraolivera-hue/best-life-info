import posthog from "posthog-js";

export type AnalyticsEventPayload = Record<string, string | number | boolean | null | undefined>;

const iulV6StepAliases: Record<string, string> = {
  preland: "preland",
  age: "age",
  goal: "goal",
  state: "zip",
  zip: "zip",
  name: "name",
  phone: "contact",
  contact: "contact",
  submit: "submit",
};

const iulV6StepNumbers: Record<string, number> = {
  preland: 0,
  age: 1,
  goal: 2,
  zip: 3,
  name: 4,
  contact: 5,
  submit: 6,
};

export function createEventId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeIulV6Step(value: unknown) {
  const step = typeof value === "string" ? value : "";
  return iulV6StepAliases[step] || step || undefined;
}

function getPostHogEventName(event: string) {
  if (event === "Lead") return "funnel_submitted";
  if (event === "Contact") return "funnel_contact_clicked";
  return "funnel_step_viewed";
}

function getPostHogStep(event: string, payload: AnalyticsEventPayload) {
  if (event === "Lead") return "submit";
  if (event === "Contact") return "contact";
  return normalizeIulV6Step(payload.step);
}

export function trackFunnelEvent(event: string, payload: AnalyticsEventPayload = {}) {
  if (typeof window === "undefined") return;

  const funnelId = typeof payload.funnel_id === "string" ? payload.funnel_id : "";
  if (funnelId !== "iul-v6") return;

  const step = getPostHogStep(event, payload);
  const stepNumber = step ? iulV6StepNumbers[step] : undefined;

  // PostHog is the single active client analytics provider. Keep this wrapper
  // as the only place that translates internal funnel events into provider names.
  posthog.capture(getPostHogEventName(event), {
    ...payload,
    funnel_id: "iul-v6",
    step,
    step_number: stepNumber ?? payload.step_number,
  });
}

export function getUtmParams() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const utmPayload: AnalyticsEventPayload = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
    const value = params.get(key);
    if (value) utmPayload[key] = value;
  });

  return utmPayload;
}
