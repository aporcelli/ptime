"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/index";
import Link from "next/link";
import type { RegistroHoras, Proyecto, Tarea } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { Edit2, Eye } from "lucide-react";

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  borrador: "secondary",
  confirmado: "default",
  facturado: "outline",
};

const ESTADOS = ["borrador", "confirmado", "facturado"] as const;
type Estado = (typeof ESTADOS)[number];

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

  const columns: Column<RegistroHoras>[] = [
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      className: "font-mono text-xs",
    },
    {
      key: "proyecto_id",
      header: "Proyecto",
      sortable: true,
      render: (r) => proyectosMap[r.proyecto_id]?.nombre ?? "—",
      className: "font-medium",
    },
    {
      key: "tarea_id",
      header: "Tarea",
      render: (r) => tareasMap[r.tarea_id]?.nombre ?? "—",
    },
    {
      key: "descripcion",
      header: "Descripción",
      className: "max-w-[200px] truncate text-slate-500",
    },
    {
      key: "horas",
      header: "Horas",
      sortable: true,
      align: "right",
      render: (r) => `${r.horas}h`,
      className: "font-mono",
    },
    {
      key: "monto_total",
      header: "Total",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className="font-semibold text-brand-600">
          {formatCurrency(r.monto_total)}
        </span>
      ),
      className: "font-mono",
    },
    {
      key: "estado",
      header: "Estado",
      render: (r) => (
        <Badge variant={ESTADO_VARIANT[r.estado] ?? "secondary"} className="capitalize">
          {r.estado}
        </Badge>
      ),
    },
  ];

  if (registros.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-12 text-center">
        <p className="text-slate-500 text-sm">No hay registros aún.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/horas/nuevo">Cargá tu primer registro →</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filtroEstado === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltroEstado(null)}
          className="rounded-full"
        >
          Todos ({registros.length})
        </Button>
        {ESTADOS.map((estado) => {
          const count = registros.filter((r) => r.estado === estado).length;
          if (count === 0) return null;
          return (
            <Button
              key={estado}
              variant={filtroEstado === estado ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroEstado(filtroEstado === estado ? null : estado)}
              className="rounded-full capitalize"
            >
              {estado} ({count})
            </Button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filtrados}
        onRowClick={(r) => router.push(`/horas/${r.id}`)}
        actions={(r) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/horas/${r.id}`)}
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/horas/${r.id}/editar`)}
              title="Editar"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
