// components/charts/TareasPieChart.tsx
// PieChart de distribución de horas por tipo de tarea usando Recharts
"use client";

import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface DataPoint {
    nombre: string;
    horas: number;
    porcentaje: number;
}

interface Props {
    data: DataPoint[];
}

const COLORES = [
    "#1A56DB", "#3B82F6", "#10B981", "#F59E0B",
    "#8B5CF6", "#EF4444", "#06B6D4", "#F97316",
];

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
            <p className="font-semibold text-ink">{d.nombre}</p>
            <p className="font-mono text-slate-600">{d.horas}h · {d.porcentaje}%</p>
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
        <text x={x} y={y} fill="#64748b" textAnchor="middle" dominantBaseline="central" fontSize={11}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function TareasPieChart({ data }: Props) {
    if (!data?.length) {
        return (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                Sin datos para mostrar
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="horas"
                    nameKey="nombre"
                    cx="50%"
                    cy="48%"
                    outerRadius={90}
                    labelLine={false}
                    label={renderLabel}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
