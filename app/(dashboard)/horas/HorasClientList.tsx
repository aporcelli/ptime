"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/index";
import Link from "next/link";
import type { RegistroHoras, Proyecto, Tarea } from "@/types/entities";

const ESTADO_BADGE: Record<string, string> = {
  borrador:   "badge badge-slate",
  confirmado: "badge badge-green",
  facturado:  "badge badge-blue",
};

const ESTADOS = ["borrador", "confirmado", "facturado"] as const;
type Estado = typeof ESTADOS[number];

const PILL_ACTIVE: Record<Estado, string> = {
  borrador:   "bg-slate-600 text-white",
  confirmado: "bg-primary-fixed text-white",
  facturado:  "bg-primary text-white",
};

interface Props {
  registros: RegistroHoras[];
  proyectosMap: Record<string, Proyecto>;
  tareasMap: Record<string, Tarea>;
}

export function HorasClientList({ registros, proyectosMap, tareasMap }: Props) {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState<Estado | null>(null);

  const filtrados = useMemo(() => {
    if (!filtroEstado) return registros;
    return registros.filter((r) => r.estado === filtroEstado);
  }, [registros, filtroEstado]);

  if (registros.length === 0) {
    return (
      <div className="bg-surface-lowest rounded-xl p-12 text-center shadow-ambient">
        <p className="text-on-surface-variant text-sm">No hay registros aún.</p>
        <Link href="/horas/nuevo" className="text-primary-fixed text-sm font-medium mt-2 inline-block hover:underline">
          Cargá tu primer registro →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter pills — Meridian */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-on-surface-variant font-medium mr-1">Estado:</span>
        <button
          onClick={() => setFiltroEstado(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filtroEstado === null
              ? "bg-primary text-white"
              : "bg-surface-low text-on-surface-variant hover:bg-surface-high"
          }`}
        >
          Todos ({registros.length})
        </button>
        {ESTADOS.map((estado) => {
          const count = registros.filter((r) => r.estado === estado).length;
          if (count === 0) return null;
          return (
            <button
              key={estado}
              onClick={() => setFiltroEstado(filtroEstado === estado ? null : estado)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                filtroEstado === estado
                  ? PILL_ACTIVE[estado]
                  : "bg-surface-low text-on-surface-variant hover:bg-surface-high"
              }`}
            >
              {estado} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabla — Meridian No-Line Rule */}
      <div className="bg-surface-lowest rounded-xl overflow-hidden shadow-ambient">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-high">
                {["Fecha", "Proyecto", "Tarea", "Descripción", "Horas", "$/h", "Total", "Estado", ""].map((h, idx) => (
                  <th
                    key={idx}
                    className="p-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-left text-on-surface-variant"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r, i) => {
                const proyecto = proyectosMap[r.proyecto_id];
                const tarea = tareasMap[r.tarea_id];
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors hover:bg-surface-low cursor-pointer ${
                      i % 2 === 0 ? "bg-surface-lowest" : "bg-surface-low"
                    }`}
                    onClick={() => router.push(`/horas/${r.id}`)}
                  >
                    <td className="p-3 font-mono text-xs text-on-surface-variant whitespace-nowrap">{r.fecha}</td>
                    <td className="p-3 font-medium text-on-surface whitespace-nowrap">{proyecto?.nombre ?? "—"}</td>
                    <td className="p-3 text-on-surface-variant whitespace-nowrap">{tarea?.nombre ?? "—"}</td>
                    <td className="p-3 text-on-surface max-w-[200px] truncate">{r.descripcion}</td>
                    <td className="p-3 text-right font-mono text-on-surface whitespace-nowrap">{r.horas}h</td>
                    <td className="p-3 text-right font-mono text-on-surface-variant whitespace-nowrap">${r.precio_hora_aplicado}</td>
                    <td className="p-3 text-right font-mono text-primary-fixed font-semibold whitespace-nowrap">{formatCurrency(r.monto_total)}</td>
                    <td className="p-3">
                      <span className={ESTADO_BADGE[r.estado] ?? "badge badge-slate"}>{r.estado}</span>
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/horas/${r.id}/editar`); }}
                        className="text-xs text-on-surface-variant hover:text-primary-fixed transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-surface-high border border-outline-variant/30"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-on-surface-variant text-sm">No hay registros con estado "{filtroEstado}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
