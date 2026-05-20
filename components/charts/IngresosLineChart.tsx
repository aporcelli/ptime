// components/charts/IngresosLineChart.tsx
// LineChart de tendencia de ingresos por mes usando Recharts
"use client";

import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TICK_COLOR } from "@/lib/utils/chart-colors";

interface DataPoint {
    mes: string;    // "2026-03"
    horas: number;
    ingresos: number;
}

interface Props {
    data: DataPoint[];
    moneda?: string;
    showHoras?: boolean;
}

const CustomTooltip = ({ active, payload, label, moneda }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="font-mono text-xs text-sub mb-1">{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.dataKey} style={{ color: entry.stroke }} className="font-mono font-medium">
                    {entry.dataKey === "horas"
                        ? `${entry.value}h`
                        : `${moneda ?? "USD"} ${entry.value.toFixed(2)}`}
                </p>
            ))}
        </div>
    );
};

export default function IngresosLineChart({ data, moneda = "USD", showHoras = false }: Props) {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center h-48 text-sub text-sm">
                Sin datos para el período
            </div>
        );
    }

    const avg = data.length > 0
        ? data.reduce((s, d) => s + d.ingresos, 0) / data.length
        : 0;

    return (
        <div role="img" aria-label="Tendencia de ingresos y horas por mes" className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <defs>
                    <linearGradient id="ingresos-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0.03} />
                    </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip moneda={moneda} />} />

                {avg > 0 && (
                    <ReferenceLine
                        y={avg}
                        stroke={CHART_COLORS[2]}
                        strokeDasharray="5 5"
                        label={{ value: "Prom.", position: "insideTopRight", fontSize: 10, fill: CHART_COLORS[2] }}
                    />
                )}

                <Area
                    type="monotone"
                    dataKey="ingresos"
                    fill="url(#ingresos-gradient)"
                    stroke="none"
                    isAnimationActive
                    animationDuration={500}
                />

                <Line
                    type="monotone"
                    dataKey="ingresos"
                    name="Ingresos"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: CHART_COLORS[0], strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                    animationDuration={650}
                />

                {showHoras && (
                    <Line
                        type="monotone"
                        dataKey="horas"
                        name="Horas"
                        stroke={CHART_COLORS[3]}
                        strokeWidth={1.7}
                        strokeDasharray="4 4"
                        dot={false}
                        isAnimationActive
                        animationDuration={650}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
        </div>
    );
}
