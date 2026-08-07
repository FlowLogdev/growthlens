"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestDataDeletion } from "./actions";

export default function DataDeletionPage() {
  const [state, formAction, pending] = useActionState(requestDataDeletion, null);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-4 text-3xl font-semibold">Delete your data</h1>
      <p className="mb-6 text-sm text-gray-600">
        Sign in, then enter the email address associated with your GrowthLens account. We use your
        signed-in session to verify ownership. This permanently deletes your account, connected
        platform tokens, and all synced metrics, posts, and insights. This cannot be undone.
      </p>

      <Link
        href="/login?redirect_to=/data-deletion"
        className="mb-6 inline-flex text-sm font-medium text-emerald-700 underline underline-offset-4"
      >
        Sign in to verify your account
      </Link>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Account email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Delete my data"}
        </button>
      </form>

      {state?.message && <p className="mt-4 text-sm text-gray-700">{state.message}</p>}
    </div>
  );
}
