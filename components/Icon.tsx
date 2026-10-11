"use client";

import {
  ArrowLeft,
  Clock,
  Package,
  ShoppingCartSimple,
  Star,
  TrendUp,
  Warning,
  type IconProps,
} from "@phosphor-icons/react";

/**
 * Server components cannot import @phosphor-icons/react directly: the package
 * calls React.createContext at module load, which does not exist in the RSC
 * runtime. Server pages go through this client wrapper instead.
 */
const ICONS = {
  "arrow-left": ArrowLeft,
  clock: Clock,
  package: Package,
  "shopping-cart": ShoppingCartSimple,
  star: Star,
  trend: TrendUp,
  warning: Warning,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  weight = "regular",
  className,
}: {
  name: IconName;
  size?: number;
  weight?: IconProps["weight"];
  className?: string;
}) {
  const C = ICONS[name];
  return <C size={size} weight={weight} className={className} />;
}
