// components/charts/HorasPorProyecto.tsx
// BarChart de horas/ingresos por proyecto usando Recharts
"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { CHART_COLORS } from "@/lib/utils/chart-colors";

interface DataPoint {
    nombre: string;
    horas: number;
    ingresos: number;
}

interface Props {
    data: DataPoint[];
    moneda?: string;
}

const CustomTooltip = ({ active, payload, label, moneda }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="chart-tooltip">
            <p className="font-semibold text-heading mb-1 truncate max-w-[180px]">{label}</p>
            {payload.map((entry: any) => (
                <p key={entry.dataKey} style={{ color: entry.fill }} className="font-mono">
                    {entry.dataKey === "horas"
                        ? `${entry.value}h`
                        : `${moneda ?? "USD"} ${entry.value.toFixed(2)}`}
                </p>
            ))}
        </div>
    );
};

export default function HorasPorProyecto({ data, moneda = "USD" }: Props) {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center h-48 text-sub text-sm">
                Sin datos para mostrar
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip content={<CustomTooltip moneda={moneda} />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="horas" name="Horas" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="ingresos" name="Ingresos" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
