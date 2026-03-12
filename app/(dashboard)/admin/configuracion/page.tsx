// app/(dashboard)/admin/configuracion/page.tsx
import type { Metadata } from "next";
import { getConfig } from "@/app/actions/config";
import ConfigForm from "./ConfigForm";

export const metadata: Metadata = { title: "Configuración" };

export default async function ConfiguracionPage() {
  const config = await getConfig();

  return (
    <div className="max-w-lg animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Configuración de precios</h1>
        <p className="text-muted-foreground mt-1">
          Los cambios aplican a todos los proyectos que no tengan precios propios.
        </p>
      </div>

      <ConfigForm defaultValues={config} />
    </div>
  );
}
