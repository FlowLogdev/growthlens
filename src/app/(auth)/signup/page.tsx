import type { Metadata } from "next";
import Link from "next/link";
import { signUp, signInWithGoogle } from "../actions";
import { isPlanTier, PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Create account",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; plan?: string }>;
}) {
  const { error, plan: requestedPlan } = await searchParams;
  const plan = isPlanTier(requestedPlan) ? requestedPlan : "starter";
  const destination = `/dashboard/billing?plan=${plan}&welcome=1`;

  return (
    <div>
      <p className="marketing-eyebrow">14-day GrowthLens trial</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Create your account</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        You selected {PLANS[plan].name} at ${PLANS[plan].price} per month. No card is required today.
      </p>

      {error && (
        <p className="mt-6 rounded-2xl border border-[#d85a5a]/30 bg-[#d85a5a]/10 p-4 text-sm text-[#a73535]">
          {error}
        </p>
      )}

      <form action={signUp} className="mt-8 space-y-5">
        <input type="hidden" name="plan" value={plan} />
        <div>
          <label htmlFor="business_name" className="form-label">Business name</label>
          <input id="business_name" name="business_name" type="text" maxLength={120} autoComplete="organization" className="form-control" placeholder="Your brand or business" />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="form-control" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input id="password" name="password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" className="form-control" />
          <p className="mt-2 text-xs text-[var(--subtle)]">Use at least 8 characters.</p>
        </div>
        <button type="submit" className="marketing-button marketing-button-primary marketing-button-large w-full">
          Create account
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--subtle)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        or
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="redirect_to" value={destination} />
        <button type="submit" className="marketing-button marketing-button-secondary marketing-button-large w-full">
          Continue with Google
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[var(--muted)]">
        Already have an account? <Link href={`/login?redirect_to=${encodeURIComponent(destination)}`} className="font-semibold text-[var(--ink)] underline decoration-[#58cc70] decoration-2 underline-offset-4">Log in</Link>
      </p>
      <p className="mt-5 text-center text-xs leading-5 text-[var(--subtle)]">
        By creating an account, you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
