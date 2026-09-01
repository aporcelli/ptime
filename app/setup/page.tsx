// app/setup/page.tsx — FUERA del (dashboard) group, no requiere sheetId
import type { Metadata } from "next";
import { auth }     from "@/auth";
import { redirect } from "next/navigation";
import { cookies }  from "next/headers";
import SetupForm    from "./SetupForm";
import SignOutButton  from "@/components/SignOutButton";
import { findSharedSheetForEmail } from "@/lib/sheets/master";

import { validateSpreadsheet } from "@/lib/sheets/client";

export const metadata: Metadata = { title: "Configurar Sheet | Ptime" };

export default async function SetupPage({ searchParams }: { searchParams?: { error?: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cookieStore = cookies();
  const sheetId = cookieStore.get("ptime-sheet-id")?.value
               ?? (session.user as { sheetId?: string }).sheetId;

  let isSheetDeleted = searchParams?.error === "SheetNotFound";

  if (sheetId && session.user.accessToken) {
    const val = await validateSpreadsheet(sheetId, session.user.accessToken);
    if (val.valid) {
      redirect("/dashboard");
    } else {
      cookieStore.delete("ptime-sheet-id");
      isSheetDeleted = true;
    }
  }

  // Verificar si tiene un workspace compartido / sheet previo persistido
  const sharedSheetId = await findSharedSheetForEmail(session.user.email ?? "");

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
          <SignOutButton />
      {/* Blobs decorativos */}
      <div aria-hidden className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl font-extrabold tracking-tight">
            P<span className="text-emerald-500 italic">time</span>
          </h1>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          <SetupForm sharedSheetId={sharedSheetId ?? undefined} initialError={isSheetDeleted ? "SheetNotFound" : undefined} />
        </div>
      </div>
    </main>
  );
}
