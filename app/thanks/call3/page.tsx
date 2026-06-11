import { Suspense } from "react";
import ThanksCall3Client from "./thanks-call3-client";
import VercelThankYouTracker from "../vercel-thank-you-tracker";

export default function ThanksCall3Page() {
  return (
    <Suspense fallback={null}>
      <VercelThankYouTracker thankYouType="call" />
      <ThanksCall3Client />
    </Suspense>
  );
}
