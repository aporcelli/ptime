// app/(dashboard)/admin/configuracion/ConfigForm.tsx
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
  precioBase:   z.coerce.number().positive("Debe ser positivo"),
  precioAlto:   z.coerce.number().positive("Debe ser positivo"),
  umbralHoras:  z.coerce.number().positive("Debe ser positivo"),
}).refine((d) => d.precioAlto > d.precioBase, {
  message: "El precio alto debe superar al precio base",
  path: ["precioAlto"],
});

type FormData = z.infer<typeof schema>;

export default function ConfigForm({ defaultValues }: { defaultValues: AppConfig }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      precioBase:   defaultValues.precioBase,
      precioAlto:   defaultValues.precioAlto,
      umbralHoras:  defaultValues.umbralHoras,
    },
  });

  async function onSubmit(data: FormData) {
    setStatus("loading");
    setServerError(null);
    const result = await updateConfig(data);
    if (!result.success) {
      setStatus("error");
      setServerError(result.error);
      return;
    }
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  }

  const inputClass = (hasError: boolean) => `
    w-full border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white
    focus:outline-none focus:ring-2 transition-all
    ${hasError ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-brand-600/30 focus:border-brand-600"}
  `;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5"
    >
      {[
        { name: "precioBase" as const,  label: "Precio base ($/h)",          hint: `Aplica hasta las {umbral}h`, icon: "$" },
        { name: "precioAlto" as const,  label: "Precio alto ($/h)",          hint: "Tras superar el umbral",     icon: "$" },
        { name: "umbralHoras" as const, label: "Umbral de horas por proyecto", hint: "Horas que activan el precio alto", icon: "h" },
      ].map(({ name, label, hint, icon }) => (
        <div key={name} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-ink">{label}</label>
            <span className="text-xs text-muted-foreground">{hint}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
              {icon}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register(name, { valueAsNumber: true })}
              className={`${inputClass(!!errors[name])} pl-8`}
            />
          </div>
          {errors[name] && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={11} /> {errors[name]?.message}
            </p>
          )}
        </div>
      ))}

      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle size={16} /> {serverError}
        </div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm"
        >
          <CheckCircle size={16} /> Configuración guardada correctamente.
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileTap={{ scale: 0.98 }}
        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {status === "loading" && <Loader2 size={16} className="animate-spin" />}
        {status === "loading" ? "Guardando…" : "Guardar configuración"}
      </motion.button>
    </form>
  );
}
