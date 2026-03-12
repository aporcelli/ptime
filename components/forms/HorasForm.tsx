// components/forms/HorasForm.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulario interactivo con validación en tiempo real y preview de precio.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, DollarSign, Clock } from "lucide-react";
import { hourFormSchema, type HourFormData } from "@/lib/schemas/hour";
import { previewMonto } from "@/lib/pricing/calculateHoursAmount";
import { createHour } from "@/app/actions/hours";
import { formatCurrency } from "@/lib/utils/index";
import type { Tarea, Proyecto, AppConfig } from "@/types/entities";

interface Props {
  tareas:        Tarea[];
  proyectos:     Proyecto[];
  defaultConfig: AppConfig;
}

export default function HorasForm({ tareas, proyectos, defaultConfig }: Props) {
  const router = useRouter();
  const [status, setStatus]         = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [previewAmount, setPreviewAmount] = useState<number>(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<HourFormData>({
    resolver: zodResolver(hourFormSchema),
    mode:     "onChange",
    defaultValues: {
      fecha:  new Date().toISOString().split("T")[0],
      horas:  1,
      estado: "confirmado",
    },
  });

  const watchedProyectoId = watch("proyecto_id");
  const watchedHoras      = watch("horas");

  // Actualizar preview de monto en tiempo real
  useEffect(() => {
    if (!watchedProyectoId || !watchedHoras) { setPreviewAmount(0); return; }

    const proyecto = proyectos.find((p) => p.id === watchedProyectoId);
    if (!proyecto) return;

    const config = {
      precioBase:   proyecto.precio_base   || defaultConfig.precioBase,
      precioAlto:   proyecto.precio_alto   || defaultConfig.precioAlto,
      umbralHoras:  proyecto.umbral_precio_alto || defaultConfig.umbralHoras,
    };

    const monto = previewMonto(Number(watchedHoras), proyecto.horas_acumuladas, config);
    setPreviewAmount(monto);
  }, [watchedProyectoId, watchedHoras, proyectos, defaultConfig]);

  const selectedProyecto = proyectos.find((p) => p.id === watchedProyectoId);

  async function onSubmit(data: HourFormData) {
    setStatus("loading");
    setServerError(null);

    const result = await createHour(data);

    if (!result.success) {
      setStatus("error");
      setServerError(result.error);
      return;
    }

    setStatus("success");
    setTimeout(() => router.push("/horas"), 1500);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-border p-6 md:p-8 flex flex-col gap-6"
      noValidate
    >
      {/* Proyecto */}
      <FieldGroup label="Proyecto" error={errors.proyecto_id?.message}>
        <select
          {...register("proyecto_id")}
          className={fieldClass(!!errors.proyecto_id)}
          defaultValue=""
        >
          <option value="" disabled>Selecciona un proyecto…</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.horas_acumuladas}h acumuladas)
            </option>
          ))}
        </select>
      </FieldGroup>

      {/* Tarea */}
      <FieldGroup label="Tarea" error={errors.tarea_id?.message}>
        <select {...register("tarea_id")} className={fieldClass(!!errors.tarea_id)} defaultValue="">
          <option value="" disabled>Selecciona una tarea…</option>
          {tareas.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </FieldGroup>

      {/* Fecha + Horas (en fila) */}
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Fecha" error={errors.fecha?.message}>
          <input type="date" {...register("fecha")} className={fieldClass(!!errors.fecha)} />
        </FieldGroup>

        <FieldGroup label="Horas" error={errors.horas?.message} hint="Mín. 0.25 (15 min)">
          <input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            {...register("horas", { valueAsNumber: true })}
            className={fieldClass(!!errors.horas)}
            placeholder="1.5"
          />
        </FieldGroup>
      </div>

      {/* Descripción */}
      <FieldGroup label="Descripción del trabajo" error={errors.descripcion?.message}>
        <textarea
          {...register("descripcion")}
          rows={3}
          placeholder="Describe brevemente el trabajo realizado…"
          className={`${fieldClass(!!errors.descripcion)} resize-none`}
        />
      </FieldGroup>

      {/* Preview de precio */}
      <AnimatePresence>
        {watchedProyectoId && watchedHoras > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-600">
                <DollarSign size={16} />
                <span className="text-sm font-medium">Monto estimado</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-semibold font-mono text-brand-700">
                  {formatCurrency(previewAmount, defaultConfig.moneda)}
                </span>
                {selectedProyecto && (
                  <p className="text-xs text-brand-500 mt-0.5 flex items-center gap-1 justify-end">
                    <Clock size={11} />
                    {selectedProyecto.horas_acumuladas}h acum. · umbral {selectedProyecto.umbral_precio_alto || defaultConfig.umbralHoras}h
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error de servidor */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            <AlertCircle size={16} className="shrink-0" />
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <motion.button
          type="submit"
          disabled={status === "loading" || status === "success"}
          whileTap={{ scale: 0.98 }}
          className="
            flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60
            text-white font-semibold rounded-lg py-3 text-sm
            flex items-center justify-center gap-2 transition-colors
          "
        >
          {status === "loading" && <Loader2 size={16} className="animate-spin" />}
          {status === "success" && <CheckCircle size={16} className="text-green-300" />}
          {status === "idle"    && "Guardar registro"}
          {status === "loading" && "Guardando…"}
          {status === "success" && "¡Guardado!"}
          {status === "error"   && "Guardar registro"}
        </motion.button>

        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-lg border border-border text-ink text-sm hover:bg-surface transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────────
function FieldGroup({
  label, error, hint, children,
}: {
  label:    string;
  error?:   string;
  hint?:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-ink">{label}</label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function fieldClass(hasError: boolean): string {
  return `
    w-full border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white
    focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all
    ${hasError
      ? "border-red-400 focus:ring-red-400/30"
      : "border-border focus:ring-brand-600/30 focus:border-brand-600"
    }
  `;
}
