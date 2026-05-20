"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";

interface DataPoint {
  fecha: string; // YYYY-MM-DD
  horas: number;
  ingresos: number;
}

interface Props {
  data: DataPoint[];
}

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
};

function movingAverage(values: number[], windowSize = 7) {
  return values.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const slice = values.slice(start, i + 1);
    const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
    return Number(avg.toFixed(2));
  });
}

export default function ActividadHeatmap({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const { option, stats } = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const fechas = sorted.map((d) => d.fecha);
    const horas = sorted.map((d) => Number(d.horas.toFixed(2)));
    const ingresos = sorted.map((d) => Number(d.ingresos.toFixed(2)));
    const ma7 = movingAverage(horas, 7);
    const activeDays = horas.filter((h) => h > 0).length;
    const avgActive = activeDays ? horas.reduce((s, h) => s + h, 0) / activeDays : 0;

    const peakHoras = Math.max(...horas, 0);
    const peakIndex = horas.findIndex((h) => h === peakHoras);

    let streak = 0;
    for (let i = horas.length - 1; i >= 0; i -= 1) {
      if (horas[i] > 0) streak += 1;
      else break;
    }

    const target = avgActive > 0 ? Number(Math.min(8, Math.max(3, avgActive)).toFixed(1)) : 6;

    const option: EChartsOption = {
      color: [theme.palette[4], theme.palette[2], theme.palette[1]],
      animationDuration: 700,
      animationDurationUpdate: 450,
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
          return `${fechas[idx]}<br/>Horas: <b>${horas[idx]}h</b><br/>Prom 7d: <b>${ma7[idx]}h</b><br/>Ingresos: <b>${ingresos[idx].toFixed(2)}</b>`;
        },
      },
      legend: {
        top: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
      },
      grid: { left: 24, right: 18, top: 28, bottom: 32 },
      xAxis: {
        type: "category",
        data: fechas.map(shortDate),
        axisLabel: {
          color: theme.muted,
          fontSize: 10,
          interval: fechas.length > 18 ? 2 : 0,
        },
        axisLine: { lineStyle: { color: theme.axisLine } },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "Horas",
          nameTextStyle: { color: theme.muted, fontSize: 11, padding: [0, 0, 0, 6] },
          axisLabel: { color: theme.muted, fontSize: 11 },
          splitLine: { lineStyle: { color: theme.grid, type: "dashed" as const, opacity: 0.55 } },
        },
      ],
      series: [
        {
          name: "Horas día",
          type: "bar" as const,
          data: horas,
          barMaxWidth: 18,
          itemStyle: {
            borderRadius: [8, 8, 2, 2],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${theme.palette[4]}EE` },
                { offset: 1, color: `${theme.palette[4]}55` },
              ],
            },
          },
          emphasis: { focus: "series" as const },
          markLine: {
            symbol: "none" as const,
            lineStyle: { type: "dashed" as const, color: theme.palette[2], width: 1.25 },
            label: { formatter: `Objetivo ${target}h`, color: theme.palette[2] },
            data: [{ yAxis: target }],
          },
        },
        {
          name: "Promedio 7 días",
          type: "line" as const,
          smooth: true,
          data: ma7,
          lineStyle: { width: 2.5, color: theme.palette[2] },
          symbol: "none" as const,
          emphasis: { focus: "series" as const },
        },
      ],
    };

    return {
      option,
      stats: {
        activeDays,
        streak,
        avgActive,
        peakHoras,
        peakDay: peakIndex >= 0 ? fechas[peakIndex] : "—",
      },
    };
  }, [data, theme]);

  if (!data.length) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-sub">Sin actividad diaria en el período</div>;
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Días activos</p>
          <p className="font-semibold text-foreground">{stats.activeDays}</p>
        </div>
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Racha actual</p>
          <p className="font-semibold text-foreground">{stats.streak} días</p>
        </div>
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Promedio/día activo</p>
          <p className="font-semibold text-foreground">{stats.avgActive.toFixed(1)}h</p>
        </div>
        <div className="rounded-xl border bg-background/50 px-3 py-2">
          <p className="text-muted-foreground">Pico diario</p>
          <p className="font-semibold text-foreground">{stats.peakHoras.toFixed(1)}h · {stats.peakDay}</p>
        </div>
      </div>
      <EChart option={option} height={330} />
    </div>
  );
}
