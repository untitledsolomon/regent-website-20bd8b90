import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore Regent's pricing and packages for Axis — the business operating system for organizations that need one connected record of sales, finance, inventory, and people.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/axis/pricing" },
};

export default function PricingRedirect() {
  redirect("/axis/pricing");
}
