"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestDataDeletion } from "./actions";

export default function DataDeletionPage() {
  const [state, formAction, pending] = useActionState(requestDataDeletion, null);

  return (
    <main className="legal-shell min-h-[100dvh] px-4 py-12 text-white/72 sm:py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/12 bg-[#0d120f]/84 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-9">
        <Link href="/" className="text-sm font-semibold text-white transition-colors hover:text-[#d9ff6b]">
          GrowthLens
        </Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#d9ff6b]">Account privacy</p>
        <h1 className="mb-4 mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Delete your data</h1>
        <p className="mb-6 text-sm leading-6 text-white/58">
          Sign in, then enter the email address associated with your GrowthLens account. We use your
          signed-in session to verify ownership. This permanently deletes your account, connected
          platform tokens, and all synced metrics, posts, and insights. This cannot be undone.
        </p>

        <Link
          href="/login?redirect_to=/data-deletion"
          className="mb-7 inline-flex text-sm font-semibold text-[#d9ff6b] underline underline-offset-4 hover:text-[#e8ffad]"
        >
          Sign in to verify your account
        </Link>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/76">
              Account email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl border border-white/16 bg-[#090e0b]/82 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#d9ff6b]/55"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-[#d96655] px-4 py-3 font-semibold text-white transition-transform hover:-translate-y-px hover:bg-[#e17261] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete my data"}
          </button>
        </form>

        {state?.message && <p role="status" className="mt-4 rounded-xl border border-white/12 bg-white/[0.05] p-3 text-sm text-white/72">{state.message}</p>}
      </div>
    </main>
  );
}
