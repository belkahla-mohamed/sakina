import Image from "next/image";

export function BrandMark({
  className = "",
  decorative = true,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src="/img/brand/mark.png"
      alt={decorative ? "" : "Sakina Stores"}
      width={434}
      height={482}
      className={className}
    />
  );
}

export function Wordmark({
  className = "",
  decorative = true,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src="/img/brand/wordmark.png"
      alt={decorative ? "" : "Sakina Stores"}
      width={732}
      height={72}
      className={className}
    />
  );
}
