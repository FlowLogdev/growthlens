"use client";

import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español (ES)" },
  { value: "pt-BR", label: "Português (BR)" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className={`inline-flex items-center gap-2 ${compact ? "" : "w-full"}`}>
      <span className={compact ? "sr-only" : "text-xs font-medium text-white/45"}>{t("Language")}</span>
      <select
        aria-label={t("Select language")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className={`${compact ? "max-w-32" : "min-w-0 flex-1"} rounded-lg border border-white/12 bg-[#111713] px-2.5 py-2 text-xs text-white/72 outline-none transition-colors hover:border-white/25 focus:border-[#d9ff6b]/55`}
      >
        {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
