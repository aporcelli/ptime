import type { Metadata } from "next";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { getWorkspaceMembers } from "@/lib/sheets/queries";
import { auth } from "@/auth";
import WorkspaceClient from "./WorkspaceClient";

export const metadata: Metadata = { title: "Workspace" };

export default async function WorkspacePage() {
  const ctx     = await getPageCtx();
  const session = await auth();
  const members = await getWorkspaceMembers(ctx);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Workspace</h1>
        <p className="text-slate-500 mt-1">
          Invitá colaboradores o viewers a trabajar en tu Google Sheet.
        </p>
      </div>

      {/* Info del workspace */}
      <div className="bg-surface-lowest rounded-xl p-4 mb-6 shadow-ambient border border-outline-variant/20">
        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Tu Sheet</p>
        <p className="text-sm font-mono text-on-surface truncate">{ctx.sheetId}</p>
        <p className="text-xs text-on-surface-variant mt-1">
          Owner: <span className="font-medium text-on-surface">{session?.user?.email}</span>
        </p>
      </div>

      <WorkspaceClient
        members={members}
        currentUserEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}
