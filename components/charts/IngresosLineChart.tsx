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

const long = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

    // Bar colors: highlight the highest bar
    const barColors = ingresos.map((v) =>
      v === peak ? theme.palette[0] : `${theme.palette[0]}55`,
    );

    const series: any[] = [
      // ── Bars ──────────────────────────────────────
      {
        name: "Ingresos",
        type: "bar",
        data: ingresos.map((v, i) => ({
          value: v,
          itemStyle: {
            color: barColors[i],
            borderRadius: [5, 5, 0, 0],
            borderColor: "transparent",
          },
        })),
        barWidth: hasManyPoints ? "50%" : "40%",
        barGap: "0%",
        barCategoryGap: hasManyPoints ? "30%" : "40%",
        emphasis: {
          itemStyle: { color: theme.palette[0] },
        },
        label: {
          show: !hasManyPoints,
          position: "top",
          color: theme.muted,
          fontSize: 10,
          formatter: (p: any) => `${moneda} ${compact(p.value)}`,
        },
      },
    ];

    // ── Trend line overlay ──────────────────────────
    if (data.length >= 3) {
      series.push({
        name: "Tendencia",
        type: "line",
        smooth: true,
        data: ingresos,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          width: 2.5,
          color: theme.palette[2],
          type: "solid",
        },
        itemStyle: { color: theme.palette[2] },
        z: 10,
      });
    }

    // ── Horas line (optional) ───────────────────────
    if (showHoras) {
      series.push({
        name: "Horas",
        type: "line",
        smooth: true,
        data: horas,
        symbol: "none",
        lineStyle: { width: 2, type: "dashed", opacity: 0.7 },
        yAxisIndex: 1,
        z: 5,
      });
    }

    const option: EChartsOption = {
      color: theme.palette,
      animationDuration: 600,
      animationDurationUpdate: 400,
      animationEasing: "cubicOut" as const,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" as const },
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
          const actualFmt = long(actual);
          const varSign = varPct >= 0 ? "+" : "";
          const diffColor = varPct >= 0 ? "#10b981" : "#ef4444";
          const h = showHoras && horas[idx] ? `<br/>Horas: <b>${horas[idx]}h</b>` : "";
          return [
            `<b>${rows[0]?.axisValue ?? ""}</b>`,
            `Ingresos: <b>${moneda} ${actualFmt}</b>${h}`,
            `<span style="color:${diffColor}">Δ vs ant: ${varSign}${varPct.toFixed(1)}%</span>`,
          ].join("<br/>");
        },
      },
      grid: { left: 24, right: 18, top: 26, bottom: hasManyPoints ? 58 : 34 },
      legend: {
        top: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
      },
      xAxis: {
        type: "category",
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
          name: moneda,
          nameTextStyle: {
            color: theme.palette[0],
            fontSize: 10,
            fontWeight: 600,
          },
          axisLabel: {
            color: theme.muted,
            fontSize: 11,
            formatter: (value: number) => `${compact(value)}`,
          },
          splitLine: {
            lineStyle: { color: theme.grid, type: "dashed", opacity: 0.6 },
          },
        },
        ...(showHoras
          ? [
              {
                type: "value" as const,
                name: "h",
                nameTextStyle: { color: theme.muted, fontSize: 10 },
                axisLabel: { color: theme.muted, fontSize: 10 },
                splitLine: { show: false },
              },
            ]
          : []),
      ],
      dataZoom: hasManyPoints
        ? [
            { type: "inside", xAxisIndex: 0, zoomOnMouseWheel: true },
            { type: "slider", xAxisIndex: 0, height: 18, bottom: 10 },
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
