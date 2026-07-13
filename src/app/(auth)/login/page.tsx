import Link from "next/link";
import { signIn, signInWithGoogle } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Log in</h1>

      {error && (
        <p className="rounded bg-red-950 p-3 text-sm text-red-300">{error}</p>
      )}

      <form action={signIn} className="space-y-4">
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
            required
            className="mt-1 w-full rounded border border-gray-600 bg-black px-3 py-2 text-white placeholder-gray-500 focus:border-white focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-white px-3 py-2 text-black hover:bg-gray-200"
        >
          Log in
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
        No account?{" "}
        <Link href="/signup" className="text-white underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
