"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";
import EChart from "@/components/charts/EChart";
import { getEchartsTheme } from "@/lib/utils/echarts-theme";
import { useLocale } from "@/components/providers/LocaleProvider";

interface DataPoint {
  nombre: string;
  horas: number;
  ingresos: number;
}

interface Props {
  data: DataPoint[];
  moneda?: string;
}

export default function HorasPorProyecto({ data, moneda = "USD" }: Props) {
  const { resolvedTheme } = useTheme();
  const theme = getEchartsTheme(resolvedTheme === "dark" ? "dark" : "light");
  const { locale } = useLocale();
  const isEn = locale === "en";

  const option: EChartsOption = useMemo(() => {
    const topData = data.slice(0, 10).reverse();
    const hoursLabel = isEn ? "Hours" : "Horas";
    const incomeLabel = isEn ? "Income" : "Ingresos";

    return {
      color: [theme.palette[3], theme.palette[1]],
      animationDuration: 650,
      animationDurationUpdate: 500,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        borderWidth: 1,
        textStyle: { color: theme.text },
        formatter: (params: any) => {
          const rows = Array.isArray(params) ? params : [params];
          const name = rows[0]?.name ?? "";
          const horas = rows.find((r: any) => r.seriesName === hoursLabel || r.seriesName === "Horas")?.value ?? 0;
          const ingresos = rows.find((r: any) => r.seriesName === incomeLabel || r.seriesName === "Ingresos")?.value ?? 0;
          return isEn
            ? `${name}<br/>Hours: <b>${horas}h</b><br/>Income: <b>${moneda} ${Number(ingresos).toFixed(2)}</b>`
            : `${name}<br/>Horas: <b>${horas}h</b><br/>Ingresos: <b>${moneda} ${Number(ingresos).toFixed(2)}</b>`;
        },
      },
      grid: { left: 8, right: 16, top: 12, bottom: 18, containLabel: true },
      legend: {
        top: 0,
        textStyle: { color: theme.muted, fontSize: 11 },
      },
      xAxis: {
        type: "value",
        axisLabel: { color: theme.muted, fontSize: 11 },
        splitLine: { lineStyle: { color: theme.grid, type: "dashed" } },
      },
      yAxis: {
        type: "category",
        data: topData.map((d) => d.nombre),
        axisLabel: { color: theme.muted, fontSize: 11 },
        axisLine: { lineStyle: { color: theme.axisLine } },
      },
      series: [
        {
          name: hoursLabel,
          type: "bar",
          data: topData.map((d) => Number(d.horas.toFixed(2))),
          barMaxWidth: 14,
          emphasis: { focus: "series" },
          itemStyle: { borderRadius: 8 },
        },
        {
          name: incomeLabel,
          type: "bar",
          data: topData.map((d) => Number(d.ingresos.toFixed(2))),
          barMaxWidth: 14,
          emphasis: { focus: "series" },
          itemStyle: { borderRadius: 8 },
        },
      ],
    };
  }, [data, moneda, theme, isEn]);

  if (!data.length) {
    return <div className="flex h-[320px] items-center justify-center text-sm text-sub">{isEn ? "No data to display" : "Sin datos para mostrar"}</div>;
  }

  return <EChart option={option} height={340} />;
}
