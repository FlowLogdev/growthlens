"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/locale-provider";

type AccountOption = {
  id: string;
  label: string;
};

export function InsightRefreshControl({ accounts }: { accounts: AccountOption[] }) {
  const router = useRouter();
  const { t } = useLocale();
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function refreshInsights() {
    if (!accountId || loading) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(
        `/api/insights/generate?account_id=${encodeURIComponent(accountId)}`,
        { method: "POST" },
      );
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setIsError(true);
        setMessage(t(payload.error ?? "Growth actions could not be refreshed."));
        return;
      }

      setMessage(t("Growth actions refreshed from the latest 30 days of data."));
      router.refresh();
    } catch {
      setIsError(true);
      setMessage(t("Growth actions could not be refreshed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  if (!accounts.length) return null;

  return (
    <div className="rounded-2xl border border-[#d9ff6b]/22 bg-[#d9ff6b]/[0.065] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1 text-xs font-semibold text-white/62">
          {t("Refresh account insights")}
          <select
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            disabled={loading}
            className="mt-2 min-h-11 w-full rounded-xl border border-white/14 bg-[#0d120f] px-3 text-sm text-white outline-none focus:border-[#d9ff6b]/55"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.label}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={refreshInsights}
          disabled={loading || !accountId}
          className="min-h-11 rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("Analyzing latest data...") : t("Refresh insights")}
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-4 text-white/38">
        {t("Pro includes up to four refreshes per day, with a six-hour cooldown per account.")}
      </p>
      {message && (
        <p aria-live="polite" className={`mt-3 text-xs ${isError ? "text-[#ff9e8b]" : "text-[#d9ff6b]"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
