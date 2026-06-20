import IulV6Client from "./page-client";

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

  return <IulV6Client initialPrelandName={initialPrelandName || null} />;
}
