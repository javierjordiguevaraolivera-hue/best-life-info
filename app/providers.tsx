"use client";

import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.location.origin + pathname;
      const params = searchParams.toString();
      if (params) url += `?${params}`;
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
    if (!posthogKey) return;

    // PostHog owns analytics now. Pageviews are captured manually above so we
    // can keep route-change behavior explicit in the App Router.
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
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
