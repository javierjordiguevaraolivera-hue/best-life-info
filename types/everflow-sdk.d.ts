declare module "@everflow/everflow-sdk" {
  type EverflowClickPayload = Record<string, string | number | boolean | undefined>;

  type EverflowSdk = {
    configure: (options: { tracking_domain?: string; tld?: string }) => void;
    click: (payload: EverflowClickPayload) => Promise<string> | string;
    getTransactionId: (offerId: string | number) => string | undefined;
    getAdvertiserTransactionId: (advertiserId: string | number) => string | undefined;
    urlParameter: (name: string) => string | null;
  };

  const EverflowSDK: EverflowSdk;
  export default EverflowSDK;
}
