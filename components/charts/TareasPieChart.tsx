// components/charts/TareasPieChart.tsx
// PieChart de distribución de horas por tipo de tarea usando Recharts
"use client";

import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { CHART_COLORS, CHART_TICK_COLOR } from "@/lib/utils/chart-colors";

interface DataPoint {
    nombre: string;
    horas: number;
    porcentaje: number;
}

interface Props {
    data: DataPoint[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="chart-tooltip">
            <p className="font-semibold text-heading">{d.nombre}</p>
            <p className="font-mono text-sub">{d.horas}h · {d.porcentaje}%</p>
        </div>
    );
};

const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const r = outerRadius + 20;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill={CHART_TICK_COLOR} textAnchor="middle" dominantBaseline="central" fontSize={11}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function TareasPieChart({ data }: Props) {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center h-48 text-sub text-sm">
                Sin datos para mostrar
            </div>
        );
    }

    const totalHoras = data.reduce((sum, d) => sum + d.horas, 0);

    return (
        <div role="img" aria-label="Distribución de horas por tipo de tarea" className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    dataKey="horas"
                    nameKey="nombre"
                    cx="50%"
                    cy="47%"
                    innerRadius={52}
                    outerRadius={92}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderLabel}
                    isAnimationActive
                    animationDuration={650}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                </Pie>

                <text
                    x="50%"
                    y="46%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={CHART_TICK_COLOR}
                    fontSize={11}
                >
                    Total
                </text>
                <text
                    x="50%"
                    y="53%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={CHART_COLORS[1]}
                    fontSize={16}
                    fontWeight={700}
                >
                    {totalHoras.toFixed(1)}h
                </text>

                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string, _entry: any, index: number) => {
                        const row = data[index] as DataPoint | undefined;
                        return row ? `${value} (${row.porcentaje}%)` : value;
                    }}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
            </PieChart>
        </ResponsiveContainer>
        </div>
    );
}
