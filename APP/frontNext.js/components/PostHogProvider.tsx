"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: "https://app.posthog.com",
        capture_pageview: false, // We'll handle pageviews manually if needed
        loaded: (posthog) => {
          if (process.env.NODE_ENV === "development") console.log("PostHog loaded");
        },
      });
    }
  }, []);

  return <>{children}</>;
}