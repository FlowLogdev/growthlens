import Image from "next/image";
import Link from "next/link";
import logo from "../../public/brand/growthlens-full.jpg";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const height = compact ? 56 : 96;
  const width = Math.round(height * (logo.width / logo.height));

  return (
    <span className="inline-flex items-center overflow-hidden rounded-md">
      <Image
        src={logo}
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
export function BrandLink({
  className = "",
  href = "/home",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} aria-label="GrowthLens home" className={className}>
      <BrandMark compact={compact} />
    </Link>
  );
}
