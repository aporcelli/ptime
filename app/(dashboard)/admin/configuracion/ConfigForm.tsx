"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { updateConfig } from "@/app/actions/config";
import type { AppConfig } from "@/types/entities";
import { useLocale } from "@/components/providers/LocaleProvider";

const schema = z.object({
  precioBase: z.coerce.number().positive("Debe ser positivo"),
  precioAlto: z.coerce.number().positive("Debe ser positivo"),
  umbralHoras: z.coerce.number().positive("Debe ser positivo"),
  usarTarifaFija: z.boolean().default(false),
}).refine((d) => d.usarTarifaFija || d.precioAlto > d.precioBase, {
  message: "El precio alto debe superar al precio base", path: ["precioAlto"],
});

type FormData = z.infer<typeof schema>;

export default function ConfigForm({ defaultValues }: { defaultValues: AppConfig }) {
  const { t, locale } = useLocale();
  const isEn = locale === "en";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFijaState, setPendingFijaState] = useState<boolean | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      precioBase: defaultValues.precioBase,
      precioAlto: defaultValues.precioAlto,
      umbralHoras: defaultValues.umbralHoras,
      usarTarifaFija: defaultValues.usarTarifaFija ?? false,
    },
  });

  const umbral = watch("umbralHoras");
  const usarTarifaFija = watch("usarTarifaFija");

  const handleToggleClick = () => {
    const nextState = !usarTarifaFija;
    setPendingFijaState(nextState);
    setShowConfirmModal(true);
  };

  const confirmToggle = () => {
    if (pendingFijaState !== null) {
      setValue("usarTarifaFija", pendingFijaState, { shouldValidate: true, shouldDirty: true });
    }
    setShowConfirmModal(false);
    setPendingFijaState(null);
  };

  async function onSubmit(data: FormData) {
    setStatus("loading"); setServerError(null);
    const result = await updateConfig(data);
    if (!result.success) { setStatus("error"); setServerError(result.error); return; }
    setStatus("success");
    setTimeout(() => setStatus("idle"), 3000);
  }

  const ic = (err: boolean) =>
    `input-field ${err ? "!border-red-400 focus:!ring-red-400/30" : ""}`;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="card p-5 flex flex-col gap-5">
        {/* Toggle Tarifa Fija */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface-low/50 dark:bg-surface-low/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500 mt-0.5">
              <Info size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-heading">
                {isEn ? "Always Use Base Price (Disable High Rate)" : "Usar Siempre Precio Base (Desactivar Precio Alto)"}
              </h4>
              <p className="text-xs text-sub mt-0.5 max-w-xl">
                {isEn
                  ? "When active, all logged hours will be calculated at the base price regardless of monthly thresholds."
                  : "Al activarlo, todas las horas cargadas se cobrarán únicamente a precio base sin importar el umbral mensual."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleClick}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              usarTarifaFija ? "bg-brand-600" : "bg-surface-high"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                usarTarifaFija ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Precio base */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium text-heading">{t.configLabelBasePrice}</label>
              {!usarTarifaFija && <span className="text-xs text-faint">{isEn ? `up to ${umbral}h` : `hasta ${umbral}h`}</span>}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm font-mono">$</span>
              <input type="number" step="0.01" min="0" {...register("precioBase")} className={`${ic(!!errors.precioBase)} pl-7`} />
            </div>
            {errors.precioBase && <p className="text-xs text-red-500">{errors.precioBase.message}</p>}
          </div>

          {/* Precio alto */}
          <div className={`flex flex-col gap-1.5 transition-opacity ${usarTarifaFija ? "opacity-40 pointer-events-none" : ""}`}>
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium text-heading">{t.configLabelHighPrice}</label>
              <span className="text-xs text-faint">{isEn ? `from ${umbral}h` : `desde h ${umbral}`}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm font-mono">$</span>
              <input type="number" step="0.01" min="0" disabled={usarTarifaFija} {...register("precioAlto")} className={`${ic(!!errors.precioAlto)} pl-7`} />
            </div>
            {errors.precioAlto && <p className="text-xs text-red-500">{errors.precioAlto.message}</p>}
          </div>

          {/* Umbral */}
          <div className={`flex flex-col gap-1.5 transition-opacity ${usarTarifaFija ? "opacity-40 pointer-events-none" : ""}`}>
            <label className="text-sm font-medium text-heading">{t.configLabelThreshold}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint text-sm font-mono">h</span>
              <input type="number" step="1" min="1" disabled={usarTarifaFija} {...register("umbralHoras")} className={`${ic(!!errors.umbralHoras)} pl-7`} />
            </div>
            {errors.umbralHoras && <p className="text-xs text-red-500">{errors.umbralHoras.message}</p>}
          </div>
        </div>

        {/* Resumen visual */}
        <div className="rounded-lg p-3 text-xs text-sub flex items-center gap-2"
          style={{ backgroundColor: "var(--bg-thead)" }}>
          <span>📊</span>
          <span>
            {usarTarifaFija ? (
              isEn ? (
                <>Fixed Rate Active: All hours billed at <strong className="text-heading">${watch("precioBase")}/h</strong> without monthly thresholds.</>
              ) : (
                <>Tarifa Fija Activa: Todas las horas se cobran a <strong className="text-heading">${watch("precioBase")}/h</strong> sin aplicar umbrales mensuales.</>
              )
            ) : isEn ? (
              <>First <strong className="text-heading">{umbral}h</strong> per project → <strong className="text-heading">${watch("precioBase")}/h</strong> · From hour {umbral} onwards → <strong className="text-heading">${watch("precioAlto")}/h</strong></>
            ) : (
              <>Primeras <strong className="text-heading">{umbral}h</strong> por proyecto → <strong className="text-heading">${watch("precioBase")}/h</strong> · A partir de la hora {umbral} → <strong className="text-heading">${watch("precioAlto")}/h</strong></>
            )}
          </span>
        </div>

        {serverError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle size={15} /> {serverError}
          </div>
        )}
        {status === "success" && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle size={15} /> {isEn ? "Settings saved." : "Configuración guardada."}
          </motion.div>
        )}

        <motion.button type="submit" disabled={status === "loading"} whileTap={{ scale: 0.98 }}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
          {status === "loading" && <Loader2 size={15} className="animate-spin" />}
          {status === "loading" ? (isEn ? "Saving…" : "Guardando…") : (isEn ? "Save settings" : "Guardar configuración")}
        </motion.button>
      </form>

      {/* Modal de Confirmación al cambiar Tarifa Fija */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="p-2.5 rounded-full bg-amber-500/10">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-base font-bold text-heading">
                  {isEn ? "Confirm Pricing Mode Change" : "Confirmar Cambio de Modo de Tarifa"}
                </h3>
              </div>

              <div className="text-xs leading-relaxed text-sub space-y-2 bg-surface-low/50 p-3.5 rounded-xl border border-border">
                {pendingFijaState ? (
                  isEn ? (
                    <>
                      <p className="font-semibold text-heading">Enabling Always Base Price Mode:</p>
                      <p>• All unbilled hours (drafts & confirmed) will be recalculated strictly at the base rate.</p>
                      <p>• High rate pricing and monthly hour thresholds will be ignored.</p>
                      <p>• Previously billed entries will remain untouched.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-heading">Al activar el modo Solo Precio Base:</p>
                      <p>• Todas las horas no facturadas (borradores y confirmadas) pasarán a cobrarse únicamente a Tarifa Base.</p>
                      <p>• Se ignorarán la tarifa alta y los umbrales mensuales de horas.</p>
                      <p>• Los registros ya facturados no sufrirán ninguna modificación.</p>
                    </>
                  )
                ) : (
                  isEn ? (
                    <>
                      <p className="font-semibold text-heading">Disabling Always Base Price Mode:</p>
                      <p>• Tiered pricing will be re-enabled.</p>
                      <p>• Hours up to the threshold will use base rate, and extra hours will use the high rate.</p>
                      <p>• Previously billed entries will remain untouched.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-heading">Al desactivar el modo Solo Precio Base:</p>
                      <p>• Se reevaluará el esquema de tarifación escalonada.</p>
                      <p>• Las horas hasta el umbral se cobrarán a tarifa base y el excedente a tarifa alta.</p>
                      <p>• Los registros ya facturados no sufrirán ninguna modificación.</p>
                    </>
                  )
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowConfirmModal(false); setPendingFijaState(null); }}
                  className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface-high transition-colors text-sub"
                >
                  {isEn ? "Cancel" : "Cancelar"}
                </button>
                <button
                  type="button"
                  onClick={confirmToggle}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                >
                  {isEn ? "Confirm & Apply" : "Confirmar cambio"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
