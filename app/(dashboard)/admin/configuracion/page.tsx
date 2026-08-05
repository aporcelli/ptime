import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAppConfig } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { cookies } from "next/headers";
import ConfigForm from "./ConfigForm";
import ResetTourButton from "@/components/onboarding/ResetTourButton";
import { Settings, Database, ShieldCheck } from "lucide-react";

import { getLocale } from "@/lib/locale";
import { dashboardTranslations } from "@/lib/dashboard-i18n";

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  const session = await auth();
  const ctx = await getPageCtx();
  const config = await getAppConfig(ctx);
  const cookieStore = cookies();
  const sheetId = cookieStore.get("ptime-sheet-id")?.value ?? "";
  const locale = getLocale();
  const t = dashboardTranslations[locale];
  const isEn = locale === "en";

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-3xl text-heading">{t.configTitle}</h1>
        <p className="text-sub mt-1">{t.configSubtitle}</p>
      </div>

      {/* Sección: Precios */}
      <section>
        <SectionHeader icon={<Settings size={16} />} title={t.configSectionPrices} />
        <ConfigForm defaultValues={config} />
      </section>

      {/* Sección: Sheet conectado */}
      <section>
        <SectionHeader icon={<Database size={16} />} title={t.configSectionSheet} />
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-heading">{t.configLabelActiveId}</p>
              <p className="font-mono text-xs text-faint mt-1 break-all">{sheetId || (isEn ? "Not configured" : "No configurado")}</p>
            </div>
            <form action={async () => {
              "use server";
              cookies().delete("ptime-sheet-id");
            }}>
              <button type="submit"
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 dark:border-red-500/20 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
                {t.configBtnDisconnect}
              </button>
            </form>
          </div>
          <a href={`https://docs.google.com/spreadsheets/d/${sheetId}`} target="_blank" rel="noopener noreferrer"
            className="mt-3 text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
            {t.configLinkOpenSheet}
          </a>
        </div>
      </section>

      {/* Sección: Tu cuenta */}
      <section>
        <SectionHeader icon={<ShieldCheck size={16} />} title={t.configSectionAccount} />
        <div className="card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {session?.user?.image && (
              <img 
                src={`/api/auth/avatar?v=${encodeURIComponent(session.user.email ?? session.user.id ?? "")}`}
                alt="Avatar" 
                className="w-10 h-10 rounded-full" 
              />
            )}
            <div>
              <p className="text-sm font-medium text-heading">{session?.user?.name}</p>
              <p className="text-xs text-faint">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
                <ResetTourButton />
                <span className={`badge ${session?.user?.role === "ADMIN" ? "badge-brand" : "badge-slate"}`}>
                  {session?.user?.role}
                </span>
              </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sub">{icon}</span>
      <h2 className="font-semibold text-heading text-sm uppercase tracking-wide">{title}</h2>
    </div>
  );
}
