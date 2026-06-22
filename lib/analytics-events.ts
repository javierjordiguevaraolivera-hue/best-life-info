import posthog from "posthog-js";
import { trackMetaPixelEvent } from "@/lib/meta-pixel";

export type AnalyticsEventPayload = Record<string, string | number | boolean | null | undefined>;

type IdentifyFunnelPersonPayload = {
  funnel_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  lead_id?: string | null;
};

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

let lastPostHogIdentifySignature = "";

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
  if (event === "PhoneValidation") return "phone_validation_completed";
  return "funnel_step_viewed";
}

function getPostHogStep(event: string, payload: AnalyticsEventPayload) {
  if (event === "Lead") return "submit";
  if (event === "Contact" || event === "PhoneValidation") return "contact";
  return normalizeIulV6Step(payload.step);
}

function trackMetaFunnelEvent(event: string, payload: AnalyticsEventPayload, step?: string) {
  // Meta Pixel is intentionally narrower than PostHog:
  // - PageView fires only when the user reaches the age step.
  // - Lead fires only after Supabase accepts the lead.
  // Keep all Meta calls here so components never call `fbq` directly.
  if (event === "PageView" && step === "age") {
    trackMetaPixelEvent("PageView", {
      ...payload,
      funnel_id: "iul-v6",
      step: "age",
      step_number: iulV6StepNumbers.age,
    });
    return;
  }

  if (event === "Lead") {
    trackMetaPixelEvent("Lead", {
      ...payload,
      funnel_id: "iul-v6",
      step: "submit",
      step_number: iulV6StepNumbers.submit,
    });
  }
}

export function trackFunnelEvent(event: string, payload: AnalyticsEventPayload = {}) {
  if (typeof window === "undefined") return;

  const funnelId = typeof payload.funnel_id === "string" ? payload.funnel_id : "";
  if (funnelId !== "iul-v6") return;

  const step = getPostHogStep(event, payload);
  const stepNumber = step ? iulV6StepNumbers[step] : undefined;

  // This wrapper is the only place that translates internal funnel events into
  // vendor events. Keep PostHog and Meta here to avoid duplicated provider calls.
  posthog.capture(getPostHogEventName(event), {
    ...payload,
    funnel_id: "iul-v6",
    step,
    step_number: stepNumber ?? payload.step_number,
  });

  trackMetaFunnelEvent(event, payload, step);
}

export function identifyFunnelPerson(payload: IdentifyFunnelPersonPayload) {
  if (typeof window === "undefined") return;
  if (payload.funnel_id !== "iul-v6") return;

  // Keep PostHog's own anonymous Distinct ID instead of replacing it with our
  // app device ID. `identify` attaches person properties to the same visitor.
  const distinctId = posthog.get_distinct_id();
  const firstName = String(payload.first_name || "").trim();
  const lastName = String(payload.last_name || "").trim();
  if (!distinctId || !firstName || !lastName) return;

  const personProperties = {
    first_name: firstName,
    last_name: lastName,
    name: `${firstName} ${lastName}`.trim(),
    ...(payload.email ? { email: String(payload.email).trim().toLowerCase() } : {}),
    ...(payload.phone_number ? { phone_number: String(payload.phone_number).trim() } : {}),
    ...(payload.lead_id ? { lead_id: String(payload.lead_id).trim() } : {}),
    funnel_id: "iul-v6",
  };
  const signature = JSON.stringify({ distinctId, personProperties });

  // Avoid repeating identify with the exact same person payload during React
  // re-renders or repeated button taps.
  if (signature === lastPostHogIdentifySignature) return;
  lastPostHogIdentifySignature = signature;

  posthog.identify(distinctId, personProperties);
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
