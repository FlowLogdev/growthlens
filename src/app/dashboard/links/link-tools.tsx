"use client";

import { useActionState, useState } from "react";
import {
  createTrackedLink,
  type CreateTrackedLinkState,
} from "./actions";

const initialState: CreateTrackedLinkState = { error: "", success: "" };

export function TrackedLinkForm() {
  const [state, action, pending] = useActionState(createTrackedLink, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-medium text-white/58">
          Link name
          <input name="title" required maxLength={80} placeholder="Summer skincare offer" className="min-h-11 rounded-xl border border-white/14 bg-[#0b100d]/70 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d9ff6b]/55" />
        </label>
        <label className="grid gap-2 text-xs font-medium text-white/58">
          Channel
          <select name="source_platform" defaultValue="instagram" className="min-h-11 rounded-xl border border-white/14 bg-[#0b100d] px-3 text-sm text-white outline-none focus:border-[#d9ff6b]/55">
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-xs font-medium text-white/58">
        Destination URL
        <input name="destination_url" type="url" required placeholder="https://yourstore.com/product" className="min-h-11 rounded-xl border border-white/14 bg-[#0b100d]/70 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d9ff6b]/55" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-medium text-white/58">
          Custom tracking name <span className="font-normal text-white/30">optional</span>
          <input name="slug" minLength={3} maxLength={48} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="summer-skincare" className="min-h-11 rounded-xl border border-white/14 bg-[#0b100d]/70 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d9ff6b]/55" />
        </label>
        <label className="grid gap-2 text-xs font-medium text-white/58">
          Campaign <span className="font-normal text-white/30">optional</span>
          <input name="utm_campaign" maxLength={80} placeholder="summer-launch" className="min-h-11 rounded-xl border border-white/14 bg-[#0b100d]/70 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#d9ff6b]/55" />
        </label>
      </div>
      {state.error && <p aria-live="polite" className="rounded-xl border border-[#ff806b]/30 bg-[#ff806b]/10 p-3 text-sm text-[#ffb5a8]">{state.error}</p>}
      {state.success && <p aria-live="polite" className="rounded-xl border border-[#58cc70]/30 bg-[#58cc70]/10 p-3 text-sm text-[#b8f2c2]">{state.success}</p>}
      <button disabled={pending} className="min-h-11 rounded-full bg-[#d9ff6b] px-5 text-sm font-bold text-[#172016] disabled:opacity-55">
        {pending ? "Creating tracking link..." : "Create tracking link"}
      </button>
    </form>
  );
}
export function CopyTrackedLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={copy} className="rounded-full border border-white/14 px-3 py-1.5 text-xs font-semibold text-white/62 hover:border-[#d9ff6b]/45 hover:text-white">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
