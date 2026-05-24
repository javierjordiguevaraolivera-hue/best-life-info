import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import PixelScripts from "./pixel-scripts";
import "./globals.css";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  title: "Best Life IUL Insurance",
  description:
    "Landing page inspired by the original BestMoney home insurance compare experience.",
  icons: {
    icon: "/best-money-assets/best-life-icon.png",
    shortcut: "/best-money-assets/best-life-icon.png",
    apple: "/best-money-assets/best-life-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      <body>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <PixelScripts />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
