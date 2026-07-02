// components/onboarding/ResetTourButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { onboardingTranslations, type Locale } from "@/lib/onboarding-i18n";

export default function ResetTourButton() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ptime-locale") as Locale | null;
    if (saved === "en" || saved === "es") {
      setLocale(saved);
    }
  }, []);

  const handleReset = () => {
    localStorage.removeItem("ptime-onboarding-completed");
    router.push("/dashboard");
    router.refresh();
  };

  const t = onboardingTranslations[locale];

  return (
    <button
      type="button"
      onClick={handleReset}
      className="text-xs text-brand-600 dark:text-emerald-400 hover:text-brand-800 dark:hover:text-emerald-300 font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-all"
    >
      <HelpCircle size={14} />
      {t.btnRestartTour}
    </button>
  );
}
