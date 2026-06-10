// app/page.tsx — Landing page (server wrapper)
import type { Metadata } from "next";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getRequestUrlFromHeaders, getLocalDevUser } from "@/lib/env/dev-access";
import LandingPage from "@/components/landing-page";

export const metadata: Metadata = {
  title: "Ptime — Professional time tracking & invoicing",
  description:
    "Ptime is a professional time-tracking and invoicing tool that uses Google Sheets as your database. Track hours, manage projects, and generate reports from your own spreadsheet.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Ptime — Professional time tracking & invoicing",
    description:
      "Track hours, manage projects, and invoice from your own Google Sheets.",
    type: "website",
  },
};

export default async function HomePage() {
  const session = await auth();
  const requestUrl = getRequestUrlFromHeaders(headers());
  const isLoggedIn = !!(session?.user || getLocalDevUser(requestUrl));

  return <LandingPage serverLoggedIn={isLoggedIn} />;
}
