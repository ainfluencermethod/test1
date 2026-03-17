"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: (...args: any[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Meta Pixel component.
 * Renders the Facebook/Meta pixel base code and fires PageView on route changes.
 *
 * To activate: set NEXT_PUBLIC_META_PIXEL_ID in .env.local
 *
 * Usage:
 *   <MetaPixel />                           — fires PageView only
 *   MetaPixel.track("Lead")                 — fire standard event
 *   MetaPixel.track("Purchase", { value: 47, currency: "EUR" })
 */
export default function MetaPixel() {
  const pathname = usePathname();

  // Fire PageView on every route change (SPA navigations)
  useEffect(() => {
    if (PIXEL_ID && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Static helper to fire events from anywhere
MetaPixel.track = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (data) {
      window.fbq("track", event, data);
    } else {
      window.fbq("track", event);
    }
  }
};

MetaPixel.trackCustom = (event: string, data?: Record<string, any>) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (data) {
      window.fbq("trackCustom", event, data);
    } else {
      window.fbq("trackCustom", event);
    }
  }
};
