import type { Metadata } from "next";
import { Suspense } from "react";
import ThanksCall2Client from "./_components/thanks-call2-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThanksCall2Page() {
  return (
    <Suspense fallback={null}>
      <ThanksCall2Client />
    </Suspense>
  );
}
