import type { Metadata } from "next";
import { ContactView } from "@/components/static/ContactView";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <ContactView />;
}
