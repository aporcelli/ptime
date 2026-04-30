// app/(dashboard)/horas/[id]/page.tsx
// Página de detalle y edición de un registro de horas
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRegistroById, getProyectos, getTareas } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import { formatCurrency, formatDateShort, formatDateTimeShort, formatHours } from "@/lib/utils/index";
import { ArrowLeft, Calendar, Clock, DollarSign, FileText, Tag } from "lucide-react";
import HoraStatusEditor from "./HoraStatusEditor";

export const metadata: Metadata = { title: "Detalle de registro" };

export default async function HoraDetailPage({ params }: { params: { id: string } }) {
    const ctx = await getPageCtx();

    const [registro, proyectos, tareas] = await Promise.all([
        getRegistroById(ctx, params.id),
        getProyectos(ctx),
        getTareas(ctx),
    ]);

    if (!registro) notFound();

    const proyecto = proyectos.find((p) => p.id === registro.proyecto_id);
    const tarea = tareas.find((t) => t.id === registro.tarea_id);

    const ESTADO_COLORS: Record<string, string> = {
        borrador: "bg-slate-100 text-slate-600",
        confirmado: "bg-green-100 text-green-700",
        facturado: "bg-blue-100 text-blue-700",
        rechazado: "bg-red-100 text-red-700",
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/horas" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="font-serif text-3xl text-foreground font-semibold tracking-tight">Detalle del registro</h1>
            </div>

            <div className="bg-card text-card-foreground rounded-2xl border border-border p-6 md:p-8 flex flex-col gap-6">
                {/* Encabezado */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-semibold text-foreground text-lg">{proyecto?.nombre ?? "—"}</p>
                        <p className="text-muted-foreground text-sm">{tarea?.nombre ?? "—"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ESTADO_COLORS[registro.estado]}`}>
                        {registro.estado}
                    </span>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<Calendar size={15} />} label="Fecha" value={formatDateShort(registro.fecha)} />
                    <InfoItem icon={<Clock size={15} />} label="Horas trabajadas" value={`${registro.horas_trabajadas ?? registro.horas}h`} />
                    <InfoItem icon={<Clock size={15} />} label="Horas a cobrar" value={`${registro.horas_a_cobrar ?? registro.horas}h`} />
                    <InfoItem icon={<DollarSign size={15} />} label="Precio aplicado" value={`$${registro.precio_hora_aplicado}/h`} />
                    <InfoItem
                        icon={<DollarSign size={15} />}
                        label="Total"
                        value={formatCurrency(registro.monto_total)}
                        highlight
                    />
                </div>

                {/* Descripción */}
                <div>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5 text-xs font-semibold uppercase tracking-wide">
                        <FileText size={13} /> Descripción
                    </div>
                    <p className="text-foreground text-sm bg-muted/30 border border-dashed border-border rounded-lg p-4 leading-relaxed">
                        {registro.descripcion}
                    </p>
                </div>

                {/* Auditoría */}
                <div className="text-xs text-muted-foreground font-mono pt-4 border-t border-border flex flex-col gap-1">
                    <p>ID: {registro.id}</p>
                    <p>Usuario: {registro.usuario_id}</p>
                    <p>Creado: {formatDateTimeShort(registro.created_at)}</p>
                    {registro.updated_at !== registro.created_at && (
                        <p>Actualizado: {formatDateTimeShort(registro.updated_at)}</p>
                    )}
                </div>

                {/* Editor de estado */}
                <HoraStatusEditor id={registro.id} estadoActual={registro.estado} />
            </div>
        </div>
    );
}

function InfoItem({
    icon, label, value, highlight = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5 text-xs font-semibold uppercase tracking-wide">
                {icon} {label}
            </div>
            <p className={`font-mono font-semibold ${highlight ? "text-primary text-xl" : "text-foreground text-lg"}`}>
                {value}
            </p>
        </div>
    );
}
