"use client";
// components/forms/horas/PricingPreviewCard.tsx
// Tarjeta de preview del monto estimado — presentacional puro.
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils/index";
import type { AppConfig, Proyecto } from "@/types/entities";

export interface PricingPreviewCardProps {
  show: boolean;
  previewAmount: number;
  selectedP?: Proyecto;
  horasAcumuladasMes: number;
  umbral: number;
  appliedRate: number;
  tierName: string;
  defaultConfig: AppConfig;
  t: {
    estimatedAmount: string;
    monthlyAcum: string;
    threshold: string;
  };
}

export function PricingPreviewCard({
  show,
  previewAmount,
  selectedP,
  horasAcumuladasMes,
  umbral,
  appliedRate,
  tierName,
  defaultConfig,
  t,
}: PricingPreviewCardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
          <div className="bg-blue-500/10 border border-blue-100 dark:border-blue-900/40 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary">
              <DollarSign size={15} />
              <span className="text-sm font-medium">{t.estimatedAmount}</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-semibold font-mono text-primary">
                {formatCurrency(previewAmount, defaultConfig.moneda)}
              </span>
              {selectedP && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1 justify-end">
                  <Clock size={11} /> {horasAcumuladasMes}h {t.monthlyAcum} · {t.threshold} {umbral}h · {tierName} ({formatCurrency(appliedRate, defaultConfig.moneda)}/h)
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
