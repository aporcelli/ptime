"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/onboarding-i18n";
import { dashboardTranslations, type DashboardTranslation } from "@/lib/dashboard-i18n";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: DashboardTranslation;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    const saved = localStorage.getItem("ptime-locale") as Locale | null;
    if (saved === "en" || saved === "es") {
      setLocaleState(saved);
    } else {
      const match = document.cookie.match(/ptime-locale=(en|es)/);
      if (match) setLocaleState(match[1] as Locale);
    }

    const handleLocaleChange = () => {
      const updated = localStorage.getItem("ptime-locale") as Locale | null;
      if (updated === "en" || updated === "es") {
        setLocaleState(updated);
      }
    };

    window.addEventListener("ptime-locale-change", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);
    return () => {
      window.removeEventListener("ptime-locale-change", handleLocaleChange);
      window.removeEventListener("storage", handleLocaleChange);
    };
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("ptime-locale", newLocale);
    localStorage.setItem("landing-locale", newLocale);
    document.cookie = `ptime-locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    window.dispatchEvent(new Event("ptime-locale-change"));
  };

  const t = dashboardTranslations[locale] || dashboardTranslations.es;

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    return {
      locale: "es" as Locale,
      setLocale: () => {},
      t: dashboardTranslations.es,
    };
  }
  return context;
}
