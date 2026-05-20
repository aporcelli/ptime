"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";

interface DataPoint {
  mes: string;
  horas: number;
  ingresos: number;
}

interface Props {
  data: DataPoint[];
  moneda?: string;
  showHoras?: boolean;
}

export default function IngresosLineChart({ data, moneda = "USD", showHoras = false }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const option: EChartsOption = useMemo(() => {
    const hasManyPoints = data.length > 8;
    const avg = data.length ? data.reduce((s, d) => s + d.ingresos, 0) / data.length : 0;

    return {
      color: theme.palette,
      animationDuration: 600,
      animationDurationUpdate: 450,
      tooltip: {
        trigger: "axis",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.text },
        valueFormatter: (value) => `${moneda} ${Number(value).toFixed(2)}`,
      },
      grid: { left: 28, right: 18, top: 20, bottom: hasManyPoints ? 56 : 28 },
      legend: {
        top: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.mes),
        axisLine: { lineStyle: { color: theme.axisLine } },
        axisLabel: { color: theme.muted, fontSize: 11 },
      },
      yAxis: [
        {
          type: "value",
          axisLabel: { color: theme.muted, fontSize: 11 },
          splitLine: { lineStyle: { color: theme.grid, type: "dashed" } },
        },
      ],
      dataZoom: hasManyPoints
        ? [
            { type: "inside", xAxisIndex: 0, zoomOnMouseWheel: true },
            { type: "slider", xAxisIndex: 0, height: 18, bottom: 8 },
          ]
        : undefined,
      series: [
        {
          name: "Ingresos",
          type: "line",
          smooth: true,
          data: data.map((d) => d.ingresos),
          lineStyle: { width: 3 },
          symbolSize: 7,
          areaStyle: { opacity: 0.18 },
          markLine: avg
            ? {
                symbol: "none",
                lineStyle: { type: "dashed", color: theme.palette[2] },
                label: { formatter: "Prom.", color: theme.palette[2] },
                data: [{ yAxis: avg }],
              }
            : undefined,
        },
        ...(showHoras
          ? [
              {
                name: "Horas",
                type: "line",
                smooth: true,
                data: data.map((d) => d.horas),
                lineStyle: { width: 2, type: "dashed" },
                symbol: "none",
                yAxisIndex: 0,
              },
            ]
          : []),
      ],
    };
  }, [data, moneda, showHoras, theme]);

  if (!data.length) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-sub">Sin datos para el período</div>;
  }

  return <EChart option={option} height={300} />;
}
