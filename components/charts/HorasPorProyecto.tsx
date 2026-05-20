// components/charts/HorasPorProyecto.tsx
// BarChart de horas/ingresos por proyecto usando Recharts
"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TICK_COLOR } from "@/lib/utils/chart-colors";

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

    const topData = data.slice(0, 8);

    return (
        <div role="img" aria-label="Comparación de horas e ingresos por proyecto" className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={topData}
                layout="vertical"
                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                barCategoryGap={10}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: CHART_TICK_COLOR }} axisLine={false} tickLine={false} />
                <YAxis
                    type="category"
                    dataKey="nombre"
                    tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
                    axisLine={false}
                    tickLine={false}
                    width={128}
                />
                <Tooltip content={<CustomTooltip moneda={moneda} />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar
                    dataKey="horas"
                    name="Horas"
                    fill={CHART_COLORS[3]}
                    radius={[0, 6, 6, 0]}
                    isAnimationActive
                    animationDuration={500}
                />
                <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill={CHART_COLORS[1]}
                    radius={[0, 6, 6, 0]}
                    isAnimationActive
                    animationDuration={650}
                />
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
}
