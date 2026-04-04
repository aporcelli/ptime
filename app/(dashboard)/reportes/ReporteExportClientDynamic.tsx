"use client";
import dynamic from "next/dynamic";
import type { ReportData } from "@/types/api";

const ReporteTemplate = dynamic(
  () => import("@/components/pdf/ReporteTemplate"),
  { ssr: false }
);

interface Props {
  data: ReportData;
  registros: any[];
  fechaDesde: string;
  fechaHasta: string;
  moneda: string;
  nombreEmpresa: string;
  // Personalización
  tituloReporte?: string;
  clienteNombre?: string;
  incluirDetalle?: boolean;
}

export function ReporteExportClientDynamic(props: Props) {
  return (
    <ReporteTemplate
      data={props.data}
      registros={props.incluirDetalle !== false ? props.registros : []}
      fechaDesde={props.fechaDesde}
      fechaHasta={props.fechaHasta}
      moneda={props.moneda}
      nombreEmpresa={props.nombreEmpresa}
      clienteNombre={props.clienteNombre}
      tituloReporte={props.tituloReporte}
      label="Descargar PDF"
    />
  );
}
