// app/page.tsx — Redirige al dashboard o login
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getRequestUrlFromHeaders, getRootRedirectTarget } from "@/lib/env/dev-access";

export default async function RootPage() {
  const session = await auth();
  redirect(getRootRedirectTarget({
    sessionUser: session?.user,
    requestUrl: getRequestUrlFromHeaders(headers()),
  }));
}
