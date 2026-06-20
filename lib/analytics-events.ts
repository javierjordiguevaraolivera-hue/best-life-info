import { pageview, track } from "@vercel/analytics";

export type AnalyticsEventPayload = Record<string, string | number | boolean | null | undefined>;

export function createEventId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const iulV6StepEvents: Record<string, string> = {
  age: "v6_step1_age",
  goal: "v6_step2_goal",
  state: "v6_step3_zip",
  name: "v6_step4_name",
  phone: "v6_step5_contact",
};

function trackVercelVirtualPage(name: string) {
  pageview({
    route: `/iul-v6/${name}`,
    path: `/iul-v6/${name}`,
  });
}

function getVercelFunnelProperties(event: string, payload: AnalyticsEventPayload) {
  if (payload.funnel_id !== "iul-v6") return null;

  return {
    event,
    funnel_id: "iul-v6",
    step: typeof payload.step === "string" ? payload.step : undefined,
    step_number: typeof payload.step_number === "number" ? payload.step_number : undefined,
    country: typeof payload.country === "string" ? payload.country : undefined,
    state: typeof payload.state === "string" ? payload.state : undefined,
    lead_id_present: Boolean(payload.lead_id || payload.external_id),
  };
}

function trackVercelFunnelEvent(event: string, payload: AnalyticsEventPayload) {
  const properties = getVercelFunnelProperties(event, payload);
  if (!properties) return;

  if (event === "PageView" || event === "ViewContent") {
    const stepEvent = typeof payload.step === "string" ? iulV6StepEvents[payload.step] : undefined;
    if (stepEvent) {
      track(stepEvent, properties);
      trackVercelVirtualPage(stepEvent);
    }
    return;
  }

  if (event === "Lead") {
    track("v6_lead_submitted", properties);
    trackVercelVirtualPage("v6_lead_submitted");
    return;
  }

  if (event === "Contact") {
    track("v6_contact_click", properties);
    trackVercelVirtualPage("v6_contact_click");
  }
}

export function trackFunnelEvent(event: string, payload: AnalyticsEventPayload = {}) {
  if (typeof window === "undefined") return;

  trackVercelFunnelEvent(event, payload);
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

export function trackVercelIulV6VirtualPage(
  name: string,
  properties: AnalyticsEventPayload = {},
) {
  if (typeof window === "undefined") return;

  track(name, {
    funnel_id: "iul-v6",
    ...properties,
  });
  pageview({
    route: `/iul-v6/${name}`,
    path: `/iul-v6/${name}`,
  });
}
