import type { Metadata } from "next";
import "./globals.css";

const siteTitle = "Best Life IUL Insurance";
const siteDescription =
  "Consulta opciones de seguro IUL y proteccion financiera con Best Life.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "Best Life",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "Best Life",
    type: "website",
    locale: "es_US",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/best-life-assets/best-life-icon.png",
    shortcut: "/best-life-assets/best-life-icon.png",
    apple: "/best-life-assets/best-life-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
