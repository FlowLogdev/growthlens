"use client";

import { useEffect } from "react";

type AdsQueue = {
  (command: "measure", event: string, payload: {
    type: "customer_action";
    amount: number;
    currency: string;
  }): void;
};

declare global {
  interface Window {
    oaiq?: AdsQueue;
  }
}

export function OpenAIAdsRegistrationEvent() {
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const measureRegistration = () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get("registration_completed") !== "1") return;

      if (!window.oaiq) {
        attempts += 1;
        if (attempts < 100) retryTimer = setTimeout(measureRegistration, 50);
        return;
      }

      window.oaiq("measure", "registration_completed", {
        type: "customer_action",
        amount: 0,
        currency: "USD",
      });

      url.searchParams.delete("registration_completed");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    };

    measureRegistration();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  return null;
}
