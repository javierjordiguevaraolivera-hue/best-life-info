import posthog from "posthog-js";

let isPostHogInitialized = false;

export function initPostHog() {
  if (typeof window === "undefined") return posthog;
  if (isPostHogInitialized) return posthog;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!posthogKey) return posthog;

  // Central PostHog initialization. Custom funnel events call this before
  // capture so early step events cannot fire before the SDK is ready.
  posthog.init(posthogKey, {
    // Managed reverse proxy configured in PostHog for best-life.info.
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://t.best-life.info",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
    session_recording: {
      // The funnel team needs phone/email visible in recordings to diagnose
      // invalid-lead drop-offs. Do not add `ph-mask` to these inputs.
      maskAllInputs: false,
    },
  });

  isPostHogInitialized = true;
  return posthog;
}

export { posthog };
