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
      src="/img/brand/sakina-stores.png"
      alt={decorative ? "" : "Sakina Stores"}
      width={859}
      height={74}
      className={className}
    />
  );
}

export function SakinaShort({
  className = "",
  decorative = true,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <Image
      src="/img/brand/sakina.png"
      alt={decorative ? "" : "Sakina"}
      width={527}
      height={94}
      className={className}
    />
  );
}
