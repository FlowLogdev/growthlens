import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-semibold">GrowthLens</h1>
      <p className="max-w-md text-gray-600">
        Connect your Facebook Page, Instagram Business account, and TikTok Business account to get
        weekly AI-generated organic growth recommendations.
      </p>
      <div className="flex gap-3">
        <Link href="/signup" className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
          Start free trial
        </Link>
        <Link href="/login" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50">
          Log in
        </Link>
      </div>
    </div>
  );
}
