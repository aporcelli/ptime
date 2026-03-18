// app/(dashboard)/horas/[id]/HoraStatusEditor.tsx
// Componente cliente para cambiar el estado de un registro de horas
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { changeHourStatus } from "@/app/actions/hours";
import type { HoraEstado } from "@/types/entities";

const ESTADOS: { value: HoraEstado; label: string; color: string }[] = [
    { value: "borrador", label: "Borrador", color: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
    { value: "confirmado", label: "Confirmado", color: "bg-green-100 text-green-700 hover:bg-green-200" },
    { value: "facturado", label: "Facturado", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
];

interface Props {
    id: string;
    estadoActual: HoraEstado;
}

export default function HoraStatusEditor({ id, estadoActual }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState<HoraEstado | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleChange(estado: HoraEstado) {
        if (estado === estadoActual) return;
        setLoading(estado);
        setError(null);
        const result = await changeHourStatus(id, estado);
        setLoading(null);
        if (!result.success) {
            setError(result.error);
        } else {
            router.refresh();
        }
    }

    return (
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Cambiar estado
            </p>
            <div className="flex flex-wrap gap-2">
                {ESTADOS.map((e) => (
                    <button
                        key={e.value}
                        onClick={() => handleChange(e.value)}
                        disabled={e.value === estadoActual || loading !== null}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed
              ${e.value === estadoActual ? "ring-2 ring-offset-1 ring-current " : ""}${e.color}`}
                    >
                        {loading === e.value && <Loader2 size={12} className="animate-spin" />}
                        {e.label}
                        {e.value === estadoActual && <span className="text-[10px] opacity-60">· actual</span>}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}
