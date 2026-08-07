import type { Metadata } from "next";
import Link from "next/link";
import { signIn, signInWithGoogle } from "../actions";

export const metadata: Metadata = {
  title: "Log in",
};

function safeDestination(value?: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string; redirect_to?: string }>;
}) {
  const { error, message, redirect_to } = await searchParams;
  const destination = safeDestination(redirect_to);

  return (
    <div>
      <p className="marketing-eyebrow">Welcome back</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Log in to GrowthLens</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Your connected channels and weekly growth plan are waiting.</p>

      {message && (
        <p className="mt-6 rounded-2xl border border-[#58cc70]/35 bg-[#58cc70]/10 p-4 text-sm text-[var(--muted)]">{message}</p>
      )}
      {error && (
        <p className="mt-6 rounded-2xl border border-[#d85a5a]/30 bg-[#d85a5a]/10 p-4 text-sm text-[#a73535]">{error}</p>
      )}

      <form action={signIn} className="mt-8 space-y-5">
        <input type="hidden" name="redirect_to" value={destination} />
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="form-control" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="form-control" />
        </div>
        <button type="submit" className="marketing-button marketing-button-primary marketing-button-large w-full">Log in</button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--subtle)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        or
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="redirect_to" value={destination} />
        <button type="submit" className="marketing-button marketing-button-secondary marketing-button-large w-full">Continue with Google</button>
      </form>

      <p className="mt-7 text-center text-sm text-[var(--muted)]">
        New to GrowthLens? <Link href="/signup" className="font-semibold text-[var(--ink)] underline decoration-[#58cc70] decoration-2 underline-offset-4">Create an account</Link>
      </p>
    </div>
  );
}
