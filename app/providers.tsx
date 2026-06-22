"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { initMetaPixel } from "@/lib/meta-pixel";
import { initPostHog, posthog } from "@/lib/posthog-client";

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
    initMetaPixel();
    initPostHog();
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
