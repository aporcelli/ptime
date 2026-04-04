// components/charts/IngresosLineChart.tsx
// LineChart de tendencia de ingresos por mes usando Recharts
"use client";

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { CHART_COLORS } from "@/lib/utils/chart-colors";

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
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip content={<CustomTooltip moneda={moneda} />} />
                {avg > 0 && (
                    <ReferenceLine y={avg} stroke="#F59E0B" strokeDasharray="5 5"
                        label={{ value: "Prom.", position: "insideTopRight", fontSize: 10, fill: "#F59E0B" }} />
                )}
                <Line
                    type="monotone" dataKey="ingresos" name="Ingresos"
                    stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[0] }}
                    activeDot={{ r: 6 }}
                />
                {showHoras && (
                    <Line
                        type="monotone" dataKey="horas" name="Horas"
                        stroke={CHART_COLORS[2]} strokeWidth={1.5} strokeDasharray="4 4" dot={false}
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
}
