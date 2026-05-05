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
  try {
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
  } catch (globalError: any) {
    if (globalError && typeof globalError === "object" && "digest" in globalError && (globalError.digest as string)?.startsWith("NEXT_REDIRECT")) {
      throw globalError;
    }
    return (
      <div className="p-8 m-8 bg-red-50 text-red-900 rounded-lg border border-red-200">
        <h2 className="text-xl font-bold mb-2">Error Crítico en Layout</h2>
        <p className="mb-4">Falló de forma imprevista el Dashboard.</p>
        <pre className="bg-red-100 p-4 rounded text-sm mt-4 overflow-auto">
          {globalError instanceof Error ? globalError.message : String(globalError)}
        </pre>
      </div>
    );
  }
}
