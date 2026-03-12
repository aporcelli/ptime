// app/(dashboard)/horas/nuevo/page.tsx
import type { Metadata } from "next";
import { getTareas, getProyectos } from "@/lib/sheets/queries";
import { getConfig } from "@/app/actions/config";
import HorasForm from "@/components/forms/HorasForm";

export const metadata: Metadata = { title: "Cargar Horas" };

export default async function NuevaHoraPage() {
  const [tareas, proyectos, config] = await Promise.all([
    getTareas(true),
    getProyectos({ soloActivos: true }),
    getConfig(),
  ]);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Cargar horas</h1>
        <p className="text-muted-foreground mt-1">
          Registra el tiempo trabajado en un proyecto
        </p>
      </div>

      <HorasForm
        tareas={tareas}
        proyectos={proyectos}
        defaultConfig={config}
      />
    </div>
  );
}
