export type AnalyticsEventPayload = Record<string, string | number | boolean | null | undefined>;

export function createEventId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function trackFunnelEvent(_event: string, _payload: AnalyticsEventPayload = {}) {
  // Vercel Analytics was intentionally removed. Keep this no-op wrapper so
  // funnel code can keep calling one internal tracking surface if a new
  // analytics provider is added later.
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
