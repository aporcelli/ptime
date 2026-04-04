// components/layout/PageHeader.tsx
// Componente reutilizable para encabezados de página con título, descripción y acciones
import type { ReactNode } from "react";

interface Props {
    title: string;
    description?: string;
    actions?: ReactNode;
    badge?: { text: string; color?: "blue" | "green" | "amber" | "red" | "gray" };
}

const badgeColors = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-slate-100 text-slate-600",
};

export default function PageHeader({ title, description, actions, badge }: Props) {
    return (
        <div className="flex items-start justify-between gap-4 mb-6">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="font-display text-3xl font-extrabold text-on-surface tracking-tight">{title}</h1>
                    {badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColors[badge.color ?? "gray"]}`}>
                            {badge.text}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-on-surface-variant mt-1 text-sm">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions}
                </div>
            )}
        </div>
    );
}
