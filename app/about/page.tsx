import type { Metadata } from "next";
import { AboutView } from "@/components/static/AboutView";

export const metadata: Metadata = { title: "À propos" };

export default function AboutPage() {
  return <AboutView />;
}
