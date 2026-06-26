// components/charts/TareasPieChart.tsx
// Distribución de horas por tarea — bar chart
"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";

interface DataPoint {
  nombre: string;
  horas: number;
  porcentaje?: number;
}

interface Props {
  data: DataPoint[];
}

const compact = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 1,
  }).format(n);

export default function TareasPieChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const option: EChartsOption = useMemo(() => {
    const sorted = [...data]
      .filter((d) => d.horas > 0)
      .sort((a, b) => a.horas - b.horas); // ascending for horizontal bar

    const nombres = sorted.map((d) => d.nombre);
    const valores = sorted.map((d) => d.horas);
    const maxVal = Math.max(...valores, 1);

    const colors = valores.map((v) => {
      const t = v / maxVal;
      const r = Math.round(59 + t * 90);
      const g = Math.round(130 - t * 30);
      const b = Math.round(246 - t * 60);
      return `rgba(${r},${g},${b},${0.7 + t * 0.3})`;
    });

    return {
      animationDuration: 500,
      animationEasing: "cubicOut",
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text },
        formatter: (p: any) => {
          const row = Array.isArray(p) ? p[0] : p;
          const pct = sorted[row?.dataIndex]?.porcentaje ?? 0;
          return `<b>${row?.name ?? ""}</b><br/>Horas: <b>${row?.value ?? 0}h</b><br/>Del total: <b>${pct}%</b>`;
        },
      },
      grid: { left: 100, right: 48, top: 4, bottom: 4 },
      xAxis: {
        type: "value",
        name: "h",
        axisLabel: { color: theme.muted, fontSize: 10 },
        splitLine: { lineStyle: { color: theme.grid, type: "dashed", opacity: 0.4 } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: nombres,
        axisLabel: {
          color: theme.text,
          fontSize: 11,
          width: 90,
          overflow: "truncate",
        },
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
          label: {
            show: true,
            position: "right",
            color: theme.muted,
            fontSize: 10,
            formatter: (p: any) => `${compact(p.value)}h`,
          },
        },
      ],
    };
  }, [data, theme]);

  if (!data.filter((d) => d.horas > 0).length) {
    return <div className="flex h-[200px] items-center justify-center text-sm text-sub">Sin datos</div>;
  }

  return <EChart option={option} height={Math.max(180, data.filter((d) => d.horas > 0).length * 42 + 24)} />;
}
