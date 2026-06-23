import { headers } from "next/headers";
import IulV6Client from "./page-client";
import { requestEverflowServerClick } from "@/lib/everflow-server";

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export default async function Page({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const requestedPreland = resolvedSearchParams.preland;
  const initialPrelandName = Array.isArray(requestedPreland)
    ? requestedPreland[0]
    : requestedPreland;
  const requestHeaders = await headers();
  const initialEverflowTransactionId = await requestEverflowServerClick(
    resolvedSearchParams,
    {
      referrer: requestHeaders.get("referer"),
      userAgent: requestHeaders.get("user-agent"),
      ipAddress: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    },
  );

  return (
    <IulV6Client
      initialPrelandName={initialPrelandName || null}
      initialEverflowTransactionId={initialEverflowTransactionId}
    />
  );
}
