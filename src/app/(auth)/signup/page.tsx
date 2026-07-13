import Link from "next/link";
import { signUp, signInWithGoogle } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Create your account</h1>

      {error && (
        <p className="rounded bg-red-950 p-3 text-sm text-red-300">{error}</p>
      )}

      <form action={signUp} className="space-y-4">
        <div>
          <label htmlFor="business_name" className="block text-sm font-medium text-white">
            Business name
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            className="mt-1 w-full rounded border border-gray-600 bg-black px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-gray-600 bg-black px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded border border-gray-600 bg-black px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-white px-3 py-2 text-black hover:bg-gray-200"
        >
          Start free trial
        </button>
      </form>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full rounded border border-gray-600 px-3 py-2 text-white hover:bg-gray-900"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-white underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
