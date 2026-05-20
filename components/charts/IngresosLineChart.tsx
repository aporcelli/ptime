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

const compact = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export default function IngresosLineChart({ data, moneda = "USD", showHoras = false }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const { option, kpis } = useMemo(() => {
    const hasManyPoints = data.length > 8;
    const ingresos = data.map((d) => Number(d.ingresos.toFixed(2)));
    const horas = data.map((d) => Number(d.horas.toFixed(2)));

    const totalIngresos = ingresos.reduce((a, b) => a + b, 0);
    const avgIngresos = ingresos.length ? totalIngresos / ingresos.length : 0;
    const last = ingresos[ingresos.length - 1] ?? 0;
    const prev = ingresos[ingresos.length - 2] ?? 0;
    const deltaPct = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    const peak = Math.max(...ingresos, 0);
    const peakIndex = ingresos.findIndex((v) => v === peak);

    const series = [
      {
        name: "Ingresos",
        type: "line" as const,
        smooth: true,
        data: ingresos,
        lineStyle: {
          width: 3.5,
          shadowBlur: 10,
          shadowColor: `${theme.palette[0]}88`,
        },
        symbol: "circle" as const,
        showSymbol: false,
        symbolSize: 7,
        emphasis: {
          focus: "series" as const,
          scale: true,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${theme.palette[0]}AA` },
              { offset: 0.6, color: `${theme.palette[0]}33` },
              { offset: 1, color: `${theme.palette[0]}08` },
            ],
          },
          opacity: 0.95,
        },
        markLine: avgIngresos
          ? {
              symbol: "none" as const,
              lineStyle: { type: "dashed" as const, color: theme.palette[2], width: 1.5 },
              label: { formatter: `Prom. ${moneda} ${compact(avgIngresos)}`, color: theme.palette[2] },
              data: [{ yAxis: avgIngresos }],
            }
          : undefined,
        markPoint: {
          symbolSize: 40,
          itemStyle: { color: theme.palette[0], borderColor: theme.tooltipBg, borderWidth: 2 },
          label: { color: "#fff", fontSize: 10, fontWeight: 700 },
          data:
            peakIndex >= 0
              ? [{ type: "max" as const, name: "Pico", valueDim: "y", coord: [peakIndex, peak] }]
              : [],
        },
      },
      ...(showHoras
        ? [
            {
              name: "Horas",
              type: "line" as const,
              smooth: true,
              data: horas,
              lineStyle: { width: 2, type: "dashed" as const, opacity: 0.85 },
              symbol: "none" as const,
              yAxisIndex: 0,
            },
          ]
        : []),
    ] as NonNullable<EChartsOption["series"]>;

    const option: EChartsOption = {
      color: theme.palette,
      animationDuration: 700,
      animationDurationUpdate: 450,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" as const },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.text },
        formatter: (params: any) => {
          const rows = Array.isArray(params) ? params : [params];
          const idx = rows[0]?.dataIndex ?? 0;
          const actual = ingresos[idx] ?? 0;
          const previous = idx > 0 ? ingresos[idx - 1] : 0;
          const varPct = previous > 0 ? ((actual - previous) / previous) * 100 : 0;
          const horasTxt = showHoras ? `<br/>Horas: <b>${horas[idx] ?? 0}h</b>` : "";
          return `${rows[0]?.axisValue ?? ""}<br/>Ingresos: <b>${moneda} ${actual.toFixed(2)}</b>${horasTxt}<br/>Δ vs ant.: <b>${varPct >= 0 ? "+" : ""}${varPct.toFixed(1)}%</b>`;
        },
      },
      grid: { left: 24, right: 18, top: 26, bottom: hasManyPoints ? 58 : 34 },
      legend: {
        top: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: data.map((d) => d.mes),
        axisLine: { lineStyle: { color: theme.axisLine } },
        axisTick: { show: false },
        axisLabel: {
          color: theme.muted,
          fontSize: 11,
          interval: hasManyPoints ? 1 : 0,
        },
      },
      yAxis: [
        {
          type: "value",
          axisLabel: {
            color: theme.muted,
            fontSize: 11,
            formatter: (value: number) => `${moneda} ${compact(value)}`,
          },
          splitLine: { lineStyle: { color: theme.grid, type: "dashed" as const, opacity: 0.6 } },
        },
      ],
      dataZoom: hasManyPoints
        ? [
            { type: "inside" as const, xAxisIndex: 0, zoomOnMouseWheel: true },
            { type: "slider" as const, xAxisIndex: 0, height: 18, bottom: 10 },
          ]
        : undefined,
      series,
    };

    return {
      option,
      kpis: {
        totalIngresos,
        avgIngresos,
        deltaPct,
        peak,
        peakLabel: peakIndex >= 0 ? data[peakIndex]?.mes : "—",
      },
    };
  }, [data, moneda, showHoras, theme]);

  if (!data.length) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-sub">Sin datos para el período</div>;
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Total período</p>
          <p className="font-semibold text-foreground">{moneda} {compact(kpis.totalIngresos)}</p>
        </div>
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Promedio mensual</p>
          <p className="font-semibold text-foreground">{moneda} {compact(kpis.avgIngresos)}</p>
        </div>
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Tendencia</p>
          <p className={`font-semibold ${kpis.deltaPct >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {kpis.deltaPct >= 0 ? "+" : ""}{kpis.deltaPct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Pico</p>
          <p className="font-semibold text-foreground">{moneda} {compact(kpis.peak)} · {kpis.peakLabel}</p>
        </div>
      </div>
      <EChart option={option} height={330} />
    </div>
  );
}
