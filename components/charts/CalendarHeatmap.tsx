// components/charts/CalendarHeatmap.tsx
// Daily activity calendar heatmap — GitHub-style contribution grid
"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";

interface DayData {
  fecha: string; // "YYYY-MM-DD"
  horas: number;
}

interface Props {
  data: DayData[];
  locale?: "en" | "es";
}

export default function CalendarHeatmap({ data, locale = "es" }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const t = locale === "en"
    ? { title: "Daily Activity", hours: "h", noData: "No data for this period" }
    : { title: "Actividad Diaria", hours: "h", noData: "Sin datos para este período" };

  const option: EChartsOption = useMemo(() => {
    const values = data.map((d) => [d.fecha, d.horas] as [string, number]);
    const maxVal = Math.max(...data.map((d) => d.horas), 1);

    return {
      tooltip: {
        position: "top",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        textStyle: { color: theme.text, fontSize: 12 },
        formatter: (p: any) => {
          const v = p.value?.[1] ?? 0;
          return `<b>${p.value?.[0] ?? ""}</b><br/>${v.toFixed(1)}${t.hours}`;
        },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        type: "piecewise" as const,
        orient: "horizontal" as const,
        left: "center",
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 2,
        textStyle: { color: theme.muted, fontSize: 9 },
        pieces: [
          { min: 0, max: 0, color: resolvedTheme === "dark" ? "#1e293b" : "#f1f5f9" },
          { min: 0.01, max: maxVal * 0.25, color: "#bbf7d0" },
          { min: maxVal * 0.25, max: maxVal * 0.5, color: "#86efac" },
          { min: maxVal * 0.5, max: maxVal * 0.75, color: "#4ade80" },
          { min: maxVal * 0.75, max: maxVal, color: "#16a34a" },
        ],
      },
      calendar: {
        top: 28,
        left: 24,
        right: 24,
        cellSize: [18, 18],
        range: data.length > 0
          ? [data[0].fecha, data[data.length - 1].fecha]
          : undefined,
        itemStyle: {
          borderWidth: 3,
          borderColor: theme.grid,
          borderRadius: 3,
        },
        yearLabel: { show: false },
        monthLabel: {
          color: theme.text,
          fontSize: 10,
          fontWeight: 600,
          margin: 4,
        },
        dayLabel: {
          color: theme.muted,
          fontSize: 9,
          nameMap: locale === "en"
            ? ["", "Mon", "", "", "", "", ""]
            : ["", "Lun", "", "", "", "", ""],
          margin: 4,
        },
        splitLine: { show: false },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: values,
          label: { show: false },
          emphasis: {
            itemStyle: { shadowBlur: 8, shadowColor: "#16a34a" },
          },
        },
      ],
    };
  }, [data, theme, resolvedTheme, locale, t]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        {t.noData}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{t.title}</h3>
      <EChart option={option} height={200} />
    </div>
  );
}
