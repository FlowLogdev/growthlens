import Image from "next/image";
import Link from "next/link";
import wordmark from "../../public/brand/growthlens-wordmark.png";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const height = compact ? 20 : 24;
  const width = Math.round(height * (wordmark.width / wordmark.height));

  return (
    <span className="inline-flex items-center rounded-md bg-neutral-950 px-2 py-1.5">
      <Image
        src={wordmark}
        alt="GrowthLens"
        height={height}
        width={width}
        priority
        className="h-auto"
        style={{ height, width }}
      />
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
