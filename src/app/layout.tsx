import type { Metadata } from "next";
import Script from "next/script";
import { cookies, headers } from "next/headers";
import { LocaleProvider } from "@/components/locale-provider";
import { OpenAIAdsRegistrationEvent } from "@/components/openai-ads-registration-event";
import { SiteTranslator } from "@/components/site-translator";
import { detectLocale, LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value) ?? detectLocale(
    headerStore.get("x-vercel-ip-country"),
    headerStore.get("accept-language"),
  );

  return (
    <html lang={locale} className="h-full antialiased">
      <Script id="openai-ads-pixel" strategy="beforeInteractive">
        {`!function(w,d,s,u){if(w.oaiq)return;var q=function(){q.q.push(arguments)};q.q=[];w.oaiq=q;var j=d.createElement(s);j.async=1;j.src=u;var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f)}(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");oaiq("init",{pixelId:"ACrX4dgzdUPj7gezivgmcb",debug:true});`}
      </Script>
      <body className="flex min-h-full flex-col">
        <LocaleProvider initialLocale={locale}>
          <OpenAIAdsRegistrationEvent />
          <SiteTranslator />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
