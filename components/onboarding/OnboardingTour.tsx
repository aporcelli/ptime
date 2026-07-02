// components/onboarding/OnboardingTour.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { onboardingTranslations, type Locale } from "@/lib/onboarding-i18n";
import { X, ChevronRight, ChevronLeft, Award } from "lucide-react";

interface OnboardingTourProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TOUR_TARGETS = [
  "", // Step 0: Welcome (no target)
  '[data-tour="sidebar-dashboard"]',   // Step 1: Dashboard
  '[data-tour="sidebar-horas"]',       // Step 2: Mis Horas
  '[data-tour="sidebar-clientes"]',    // Step 3: Clientes
  '[data-tour="sidebar-proyectos"]',   // Step 4: Proyectos
  '[data-tour="sidebar-tareas"]',      // Step 5: Tareas
  '[data-tour="sidebar-configuracion"]', // Step 6: Configuración
  ""  // Step 7: Finished (no target)
];

export default function OnboardingTour({ sidebarOpen, setSidebarOpen }: OnboardingTourProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [locale, setLocale] = useState<Locale>("en");
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  
  const setSidebarOpenRef = useRef(setSidebarOpen);
  setSidebarOpenRef.current = setSidebarOpen;

  // 1. Check if tour is already completed
  useEffect(() => {
    setMounted(true);
    const completed = localStorage.getItem("ptime-onboarding-completed");
    const activeLocale = (localStorage.getItem("ptime-locale") as Locale | null) || "en";
    setLocale(activeLocale);
    
    if (!completed) {
      // Small timeout to let dashboard load before starting tour
      const t = setTimeout(() => {
        setActive(true);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, []);

  // 2. Position updates for targeted items
  const updatePosition = useCallback(() => {
    if (!active) return;
    const selector = TOUR_TARGETS[step];
    if (!selector) {
      setHighlightRect(null);
      return;
    }

    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setHighlightRect(null);
    }
  }, [active, step]);

  // Recalculate positioning on resize, scroll, or step change
  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [step, active, updatePosition]);

  // 3. Coordinate Mobile Sidebar Drawer
  useEffect(() => {
    if (!active) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Steps 1 to 6 correspond to sidebar navigation links
      if (step >= 1 && step <= 6) {
        setSidebarOpenRef.current(true);
      } else {
        setSidebarOpenRef.current(false);
      }
    }
  }, [step, active]);

  if (!mounted || !active) return null;

  const t = onboardingTranslations[locale];
  const currentStepData = t.tourSteps[step];
  const hasTarget = !!highlightRect;

  const handleNext = () => {
    if (step < t.tourSteps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("ptime-onboarding-completed", "true");
    setActive(false);
    setSidebarOpenRef.current(false);
  };

  const handleFinish = () => {
    localStorage.setItem("ptime-onboarding-completed", "true");
    setActive(false);
    setSidebarOpenRef.current(false);
  };

  // Determine floating card position based on highlight target
  const getCardStyle = (): React.CSSProperties => {
    if (!highlightRect) {
      // Center card
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 110,
      };
    }

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Mobile position: bottom of viewport, next to opened sidebar
      return {
        position: "fixed",
        bottom: "24px",
        left: "240px", // Just right of the mobile drawer (220px)
        width: "calc(100vw - 264px)",
        maxWidth: "340px",
        zIndex: 110,
      };
    }

    // Desktop position: Float immediately to the right of target link
    return {
      position: "fixed",
      top: `${highlightRect.top}px`,
      left: `${highlightRect.left + highlightRect.width + 16}px`,
      zIndex: 110,
    };
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 100 }}>
      {/* ── 1. Backdrop Overlay ── */}
      <div 
        className="fixed inset-0 bg-black/60 pointer-events-auto"
        onClick={handleSkip}
        aria-hidden="true"
        style={{ zIndex: 101 }}
      />

      {/* ── 2. SVG Highlight Cutout / Overlay ── */}
      {hasTarget && highlightRect && (
        <div
          className="fixed border-2 border-emerald-500 rounded-xl bg-transparent transition-all duration-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)] pointer-events-none"
          style={{
            top: `${highlightRect.top - 4}px`,
            left: `${highlightRect.left - 4}px`,
            width: `${highlightRect.width + 8}px`,
            height: `${highlightRect.height + 8}px`,
            zIndex: 105,
          }}
        />
      )}

      {/* ── 3. Interactive Floating Tooltip Card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={getCardStyle()}
          className="w-full max-w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl pointer-events-auto select-text"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {t.tourStatus} {step + 1} / {t.tourSteps.length}
            </span>
            <button 
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t.btnSkip}
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-100 mb-1.5 leading-snug">
            {currentStepData.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
            {currentStepData.desc}
          </p>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <button
              onClick={handleSkip}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {t.btnSkip}
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all active:scale-95"
                >
                  <ChevronLeft size={13} /> {t.btnBack}
                </button>
              )}

              {step < t.tourSteps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/15 transition-all active:scale-95"
                >
                  {t.btnNext} <ChevronRight size={13} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/15 transition-all active:scale-95"
                >
                  <Award size={13} /> {t.btnFinish}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
