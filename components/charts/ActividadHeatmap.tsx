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

export default function ActividadHeatmap({ data }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");

  const option: EChartsOption = useMemo(() => {
    const values = data.map((d) => Number(d.horas.toFixed(2)));
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);

    const sortedDates = [...data].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const start = sortedDates[0]?.fecha;
    const end = sortedDates[sortedDates.length - 1]?.fecha;

    return {
      animationDuration: 600,
      tooltip: {
        position: "top",
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.text },
        formatter: (params: any) => {
          const [fecha, horas] = params.value;
          return `${fecha}<br/>Horas: <b>${horas}h</b>`;
        },
      },
      visualMap: {
        min,
        max,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: 6,
        textStyle: { color: theme.muted, fontSize: 11 },
        inRange: {
          color: [theme.splitArea, theme.palette[0]],
        },
      },
      calendar: {
        top: 20,
        left: 20,
        right: 20,
        range: start && end ? [start, end] : undefined,
        cellSize: [14, 14],
        itemStyle: {
          borderWidth: 1,
          borderColor: theme.grid,
        },
        splitLine: {
          lineStyle: {
            color: theme.grid,
            width: 1,
          },
        },
        yearLabel: { show: false },
        monthLabel: {
          color: theme.muted,
          nameMap: "es",
          fontSize: 11,
        },
        dayLabel: {
          firstDay: 1,
          nameMap: "es",
          color: theme.muted,
          fontSize: 10,
        },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: data.map((d) => [d.fecha, Number(d.horas.toFixed(2))]),
        },
      ],
    };
  }, [data, theme]);

  if (!data.length) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-sub">Sin actividad diaria en el período</div>;
  }

  return <EChart option={option} height={300} />;
}
