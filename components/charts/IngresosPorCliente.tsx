// components/charts/IngresosPorCliente.tsx
"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";

interface DataPoint {
  nombre: string;
  ingresos: number;
}

interface Props {
  data: DataPoint[];
  moneda?: string;
}

const compact = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export default function IngresosPorCliente({ data, moneda = "USD" }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const option: EChartsOption = useMemo(() => {
    // Sort descending, top clients
    const sorted = [...data]
      .filter((d) => d.ingresos > 0)
      .sort((a, b) => a.ingresos - b.ingresos); // ascending for horizontal bar

    const nombres = sorted.map((d) => d.nombre);
    const valores = sorted.map((d) => d.ingresos);
    const maxVal = Math.max(...valores, 1);

    // Color gradient: higher = more intense
    const colors = valores.map(
      (v) => {
        const t = v / maxVal;
        const r = Math.round(16 + t * 60);
        const g = Math.round(185 - t * 50);
        const b = Math.round(129 - t * 30);
        return `rgba(${r},${g},${b},${0.65 + t * 0.35})`;
      }
    );

    return {
      color: [theme.palette[0]],
      animationDuration: 600,
      animationEasing: "cubicOut" as const,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" as const },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text },
        formatter: (p: any) => {
          const row = Array.isArray(p) ? p[0] : p;
          return `<b>${row?.name ?? ""}</b><br/>Ingresos: <b>${moneda} ${(row?.value ?? 0).toFixed(2)}</b>`;
        },
      },
      grid: { left: 100, right: 48, top: 8, bottom: 8 },
      xAxis: {
        type: "value",
        axisLabel: {
          color: theme.muted,
          fontSize: 10,
          formatter: (v: number) => `${moneda} ${compact(v)}`,
        },
        splitLine: { lineStyle: { color: theme.grid, type: "dashed", opacity: 0.4 } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: nombres,
        axisLabel: {
          color: theme.text,
          fontSize: 12,
          width: 90,
          overflow: "truncate",
          fontWeight: 500,
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      series: [
        {
          type: "bar",
          data: valores.map((v, i) => ({
            value: v,
            itemStyle: {
              color: colors[i],
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: "60%",
          emphasis: {
            itemStyle: { borderRadius: [0, 6, 6, 0] },
          },
          label: {
            show: true,
            position: "right",
            color: theme.muted,
            fontSize: 10,
            fontWeight: 500,
            formatter: (p: any) => `${moneda} ${compact(p.value)}`,
          },
        },
      ],
    };
  }, [data, moneda, theme]);

  if (!data.filter((d) => d.ingresos > 0).length) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-sub">Sin datos para el período</div>;
  }

  return <EChart option={option} height={Math.max(220, data.filter((d) => d.ingresos > 0).length * 42 + 40)} />;
}
