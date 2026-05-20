"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";

interface DataPoint {
  nombre: string;
  horas: number;
  porcentaje: number;
}

interface Props {
  data: DataPoint[];
}

export default function TareasPieChart({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const option: EChartsOption = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.horas, 0);
    return {
      color: theme.palette,
      animationDuration: 650,
      animationDurationUpdate: 500,
      tooltip: {
        trigger: "item",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.text },
        formatter: (p: any) => `${p.name}<br/>${p.value}h · ${p.percent}%`,
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: { color: theme.muted, fontSize: 11 },
      },
      graphic: [
        {
          type: "text",
          left: "center",
          top: "38%",
          style: {
            text: "Total",
            fill: theme.muted,
            fontSize: 11,
            fontWeight: 500,
          },
        },
        {
          type: "text",
          left: "center",
          top: "47%",
          style: {
            text: `${total.toFixed(1)}h`,
            fill: theme.text,
            fontSize: 18,
            fontWeight: 700,
          },
        },
      ],
      series: [
        {
          name: "Tareas",
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "43%"],
          padAngle: 1.5,
          itemStyle: { borderRadius: 6, borderColor: "transparent", borderWidth: 1 },
          label: {
            show: true,
            formatter: ({ percent }: any) => (percent >= 6 ? `${percent}%` : ""),
            color: theme.muted,
            fontSize: 11,
          },
          labelLine: { length: 8, length2: 6 },
          data: data.map((d) => ({ name: d.nombre, value: Number(d.horas.toFixed(2)) })),
          emphasis: {
            scale: true,
            scaleSize: 6,
          },
        },
      ],
    };
  }, [data, theme]);

  if (!data.length) {
    return <div className="flex h-[280px] items-center justify-center text-sm text-sub">Sin datos para mostrar</div>;
  }

  return <EChart option={option} height={320} />;
}
