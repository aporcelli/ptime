"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { updateConfig } from "@/app/actions/config";
import type { AppConfig } from "@/types/entities";

const schema = z.object({
  precioBase:  z.coerce.number().positive("Debe ser positivo"),
  precioAlto:  z.coerce.number().positive("Debe ser positivo"),
  umbralHoras: z.coerce.number().positive("Debe ser positivo"),
}).refine((d) => d.precioAlto > d.precioBase, {
  message: "El precio alto debe superar al precio base", path: ["precioAlto"],
});

type FormData = z.infer<typeof schema>;

export default function ConfigForm({ defaultValues }: { defaultValues: AppConfig }) {
  const [status, setStatus]     = useState<"idle"|"loading"|"success"|"error">("idle");
  const [serverError, setServerError] = useState<string|null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      precioBase:  defaultValues.precioBase,
      precioAlto:  defaultValues.precioAlto,
      umbralHoras: defaultValues.umbralHoras,
    },
  });

  const umbral = watch("umbralHoras");

  async function onSubmit(data: FormData) {
    setStatus("loading"); setServerError(null);
    const result = await updateConfig(data);
    if (!result.success) { setStatus("error"); setServerError(result.error); return; }
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  }

  const ic = (err: boolean) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 transition-all
    ${err ? "border-red-400 focus:ring-red-400/30" : "border-slate-200 focus:ring-brand-600/30 focus:border-brand-600"}`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Precio base */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-slate-700">Precio base</label>
            <span className="text-xs text-slate-400">hasta {umbral}h</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">$</span>
            <input type="number" step="0.01" min="0" {...register("precioBase")} className={`${ic(!!errors.precioBase)} pl-7`} />
          </div>
          {errors.precioBase && <p className="text-xs text-red-500">{errors.precioBase.message}</p>}
        </div>

        {/* Precio alto */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-slate-700">Precio alto</label>
            <span className="text-xs text-slate-400">desde h {umbral}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">$</span>
            <input type="number" step="0.01" min="0" {...register("precioAlto")} className={`${ic(!!errors.precioAlto)} pl-7`} />
          </div>
          {errors.precioAlto && <p className="text-xs text-red-500">{errors.precioAlto.message}</p>}
        </div>

        {/* Umbral */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Umbral (horas)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">h</span>
            <input type="number" step="1" min="1" {...register("umbralHoras")} className={`${ic(!!errors.umbralHoras)} pl-7`} />
          </div>
          {errors.umbralHoras && <p className="text-xs text-red-500">{errors.umbralHoras.message}</p>}
        </div>
      </div>

      {/* Resumen visual */}
      <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 flex items-center gap-2">
        <span>📊</span>
        <span>
          Primeras <strong className="text-slate-700">{umbral}h</strong> por proyecto → <strong className="text-slate-700">${watch("precioBase")}/h</strong> ·
          A partir de la hora {umbral} → <strong className="text-slate-700">${watch("precioAlto")}/h</strong>
        </span>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={15} /> {serverError}
        </div>
      )}
      {status === "success" && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle size={15} /> Configuración guardada.
        </motion.div>
      )}

      <motion.button type="submit" disabled={status === "loading"} whileTap={{ scale: 0.98 }}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
        {status === "loading" && <Loader2 size={15} className="animate-spin" />}
        {status === "loading" ? "Guardando…" : "Guardar configuración"}
      </motion.button>
    </form>
  );
}
