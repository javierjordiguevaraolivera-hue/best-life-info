import type { AnalyticsEventPayload } from "@/lib/analytics-events";

type MetaFbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: MetaFbq;
  }
}

const metaPixelScriptId = "meta-pixel-sdk";
const trackedMetaEvents = new Set<string>();
let initializedPixelIds: string[] = [];

function getMetaPixelIds() {
  return (process.env.NEXT_PUBLIC_META_PIXEL_IDS || "")
    .split(",")
    .map((pixelId) => pixelId.trim())
    .filter((pixelId) => /^\d+$/.test(pixelId));
}

function installMetaPixelStub() {
  if (typeof window === "undefined") return null;
  if (window.fbq) return window.fbq;

  const fbq: MetaFbq = (...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue = fbq.queue || [];
    fbq.queue.push(args);
  };

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

export function initMetaPixel() {
  if (typeof window === "undefined") return [];

  const pixelIds = getMetaPixelIds();
  if (pixelIds.length === 0) return [];

  const fbq = installMetaPixelStub();
  if (!fbq) return [];

  pixelIds
    .filter((pixelId) => !initializedPixelIds.includes(pixelId))
    .forEach((pixelId) => {
      // Initialize every configured pixel, but do not fire automatic PageView.
      // Funnel step events decide exactly when Meta receives PageView/Lead.
      fbq("init", pixelId);
    });

  initializedPixelIds = Array.from(new Set([...initializedPixelIds, ...pixelIds]));

  if (!document.getElementById(metaPixelScriptId)) {
    const script = document.createElement("script");
    script.id = metaPixelScriptId;
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  return initializedPixelIds;
}

function cleanMetaPayload(payload: AnalyticsEventPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== "")
  );
}

function getSessionDedupKey(eventName: string, payload: AnalyticsEventPayload) {
  if (eventName === "Lead") {
    const leadId = typeof payload.lead_id === "string" ? payload.lead_id : "";
    return leadId ? `bf_meta_lead_tracked_${leadId}` : "";
  }

  return "";
}

function wasAlreadyTracked(dedupKey: string) {
  if (!dedupKey) return false;
  if (trackedMetaEvents.has(dedupKey)) return true;

  try {
    return window.sessionStorage.getItem(dedupKey) === "true";
  } catch {
    return false;
  }
}

function markTracked(dedupKey: string) {
  if (!dedupKey) return;
  trackedMetaEvents.add(dedupKey);

  try {
    window.sessionStorage.setItem(dedupKey, "true");
  } catch {
    // Session storage is best-effort; the in-memory set still protects this page.
  }
}

export function trackMetaPixelEvent(eventName: "PageView" | "Lead", payload: AnalyticsEventPayload = {}) {
  if (typeof window === "undefined") return;

  const pixelIds = initMetaPixel();
  if (pixelIds.length === 0 || !window.fbq) return;

  const dedupKey = getSessionDedupKey(eventName, payload);
  if (wasAlreadyTracked(dedupKey)) return;

  const eventId = typeof payload.event_id === "string" ? payload.event_id : undefined;
  const eventOptions = eventId ? { eventID: eventId } : undefined;

  window.fbq("track", eventName, cleanMetaPayload(payload), eventOptions);
  markTracked(dedupKey);
}
