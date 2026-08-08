import type { Metadata } from "next";
import Script from "next/script";
import { OpenAIAdsRegistrationEvent } from "@/components/openai-ads-registration-event";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://usegrowthlens.com"),
  title: {
    default: "GrowthLens | AI social growth intelligence",
    template: "%s | GrowthLens",
  },
  description:
    "Connect your social channels and get evidence-backed AI recommendations for organic growth.",
  openGraph: {
    title: "GrowthLens | AI social growth intelligence",
    description:
      "Connect your social channels and turn performance data into a practical weekly growth plan.",
    url: "https://usegrowthlens.com",
    siteName: "GrowthLens",
    images: [
      {
        url: "/brand/growthlens-hero.png",
        width: 1536,
        height: 1024,
        alt: "GrowthLens social data streams converging into a growth signal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrowthLens | AI social growth intelligence",
    description: "Turn your social signals into a sharper weekly growth plan.",
    images: ["/brand/growthlens-hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <Script id="openai-ads-pixel" strategy="beforeInteractive">
        {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"ACrX4dgzdUPj7gezivgmcb",debug:true});`}
      </Script>
      <body className="flex min-h-full flex-col">
        <OpenAIAdsRegistrationEvent />
        {children}
      </body>
    </html>
  );
}
