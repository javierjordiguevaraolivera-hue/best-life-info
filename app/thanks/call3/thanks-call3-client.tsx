"use client";

import { useSearchParams } from "next/navigation";
import BenchCall3Page from "./bench-call3-page";

export default function ThanksCall3Client() {
  const searchParams = useSearchParams();

  return (
    <BenchCall3Page
      funnelId={searchParams.get("funnel_id") || ""}
      ageGroup={searchParams.get("age_group") || ""}
      insuranceGoal={searchParams.get("insurance_goal") || ""}
      leadId={searchParams.get("lead_id") || ""}
      firstName={searchParams.get("first_name") || ""}
      applicationNumber={searchParams.get("application_number") || ""}
      phoneNumber={searchParams.get("ppc_phone") || ""}
      ringbaCampaignId={searchParams.get("ringba_campaign_id") || ""}
    />
  );
}
