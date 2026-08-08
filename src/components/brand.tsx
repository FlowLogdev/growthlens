import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="relative block size-9 overflow-hidden rounded-[11px] bg-[#111812] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]"
      >
        <span className="absolute bottom-2 left-2 h-2 w-1.5 rounded-sm bg-[#ff7d66]" />
        <span className="absolute bottom-2 left-[15px] h-3.5 w-1.5 rounded-sm bg-[#67c7f2]" />
        <span className="absolute bottom-2 left-[22px] h-5 w-1.5 rounded-sm bg-[#7be58c]" />
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#d9ff6b] shadow-[0_0_8px_rgba(217,255,107,0.85)]" />
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
          GrowthLens
        </span>
      )}
    </span>
  );
}
export function BrandLink({ className = "", href = "/home" }: { className?: string; href?: string }) {
  return (
    <Link href={href} aria-label="GrowthLens home" className={className}>
      <BrandMark />
    </Link>
  );
}
