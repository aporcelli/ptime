// components/charts/HorasPorProyecto.tsx
// BarChart de horas/ingresos por proyecto usando Recharts
"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

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
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
            <p className="font-semibold text-ink mb-1 truncate max-w-[180px]">{label}</p>
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
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                Sin datos para mostrar
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                    dataKey="nombre"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip content={<CustomTooltip moneda={moneda} />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="horas" name="Horas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
