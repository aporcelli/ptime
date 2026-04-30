// app/(dashboard)/layout.tsx — Server Component (sin "use client")
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getRequestUrlFromHeaders, resolveProtectedAppAccess } from "@/lib/env/dev-access";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = cookies();
  const access = resolveProtectedAppAccess({
    session,
    cookieSheetId: cookieStore.get("ptime-sheet-id")?.value,
    requestUrl: getRequestUrlFromHeaders(headers()),
  });
  if (access.kind === "redirect") redirect(access.target);

  return (
    <DashboardShell role={access.user.role} user={access.user}>
      {children}
    </DashboardShell>
  );
}
