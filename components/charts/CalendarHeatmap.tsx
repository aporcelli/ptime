// components/charts/CalendarHeatmap.tsx
// Calendario de actividad mensual nativo — Grid de cuadrados perfectos (Tailwind)
"use client";

import { useMemo } from "react";

interface DayData {
  fecha: string; // "YYYY-MM-DD"
  horas: number;
}

interface Props {
  data: DayData[];
  locale?: "en" | "es";
}

// Días de la semana
const DAYS_ES = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function CalendarHeatmap({ data, locale = "es" }: Props) {
  const t = locale === "en"
    ? { title: "Daily Activity", hours: "h worked", noData: "No entries this month" }
    : { title: "Actividad Diaria", hours: "h cargadas", noData: "Sin registros este mes" };

  const weekdays = locale === "en" ? DAYS_EN : DAYS_ES;

  const { gridCells, monthLabel } = useMemo(() => {
    if (!data.length) return { gridCells: [], monthLabel: "" };

    // Extraer año y mes del primer dato
    const [yearStr, monthStr] = data[0].fecha.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    // Etiqueta del mes
    const monthName = locale === "en" 
      ? new Date(year, month - 1).toLocaleString("en-US", { month: "long" })
      : MONTHS_ES[month - 1];
    const monthLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

    // Primer día del mes
    const firstDay = new Date(year, month - 1, 1);
    // JS Day: 0 (Dom) a 6 (Sab). Convertimos a 0 (Lun) a 6 (Dom)
    const startOffset = (firstDay.getDay() + 6) % 7;

    // Cantidad de días en el mes
    const daysInMonth = new Date(year, month, 0).getDate();

    // Crear mapa de horas por día para lookup rápido (key: "DD")
    const hoursMap = new Map<string, number>();
    for (const d of data) {
      const [, , day] = d.fecha.split("-");
      hoursMap.set(day, d.horas);
    }

    const cells: Array<{ dayNum?: number; fecha?: string; horas: number }> = [];

    // Celdas vacías de relleno al inicio del mes
    for (let i = 0; i < startOffset; i++) {
      cells.push({ horas: 0 });
    }

    // Celdas del mes real
    for (let d = 1; d <= daysInMonth; d++) {
      const dayKey = String(d).padStart(2, "0");
      const horas = hoursMap.get(dayKey) ?? 0;
      const fecha = `${yearStr}-${monthStr}-${dayKey}`;
      cells.push({ dayNum: d, fecha, horas });
    }

    return { gridCells: cells, monthLabel };
  }, [data, locale]);

  if (!data.length) {
    return (
      <div className="card p-6 flex items-center justify-center h-[180px] border-dashed text-sm text-muted-foreground">
        {t.noData}
      </div>
    );
  }

  // Obtener intensidad de verde según horas
  function getIntensityClass(horas: number) {
    if (horas === 0) return "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-muted-foreground/30";
    if (horas <= 2) return "bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/10";
    if (horas <= 5) return "bg-emerald-300 hover:bg-emerald-400 dark:bg-emerald-800/50 dark:hover:bg-emerald-800/70 text-emerald-900 dark:text-emerald-200 border border-emerald-300/50 dark:border-emerald-500/20";
    if (horas <= 8) return "bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600/50 shadow-sm shadow-emerald-500/10";
    return "bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-800/50 shadow-md shadow-emerald-600/20";
  }

  return (
    <div className="card p-5 md:p-6 flex flex-col gap-4">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-heading text-sm uppercase tracking-wider flex items-center gap-2">
          <span>📅</span> {t.title}
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-foreground font-mono">
          {monthLabel}
        </span>
      </div>

      {/* Grid del Calendario */}
      <div className="max-w-md mx-auto w-full">
        {/* Cabecera de días (L M M J V S D) */}
        <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
          {weekdays.map((day) => (
            <div key={day} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Cuerpo del calendario (cuadrados perfectos) */}
        <div className="grid grid-cols-7 gap-1.5">
          {gridCells.map((cell, idx) => {
            if (!cell.dayNum) {
              // Celda de relleno vacía
              return (
                <div 
                  key={`empty-${idx}`} 
                  className="aspect-square rounded-lg bg-transparent border border-transparent"
                />
              );
            }

            const intensityClass = getIntensityClass(cell.horas);
            const tooltip = cell.horas > 0
              ? `${cell.dayNum} ${monthLabel} · ${cell.horas.toFixed(1)}${t.hours}`
              : `${cell.dayNum} ${monthLabel} · Sin horas`;

            return (
              <div
                key={cell.fecha}
                title={tooltip}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center 
                  relative cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95
                  ${intensityClass}
                `}
              >
                {/* Número del día */}
                <span className="text-xs font-mono font-bold select-none">
                  {cell.dayNum}
                </span>

                {/* Puntito de indicador en la esquina si tiene muchas horas */}
                {cell.horas > 8 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda de Intensidades */}
      <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        <span>Less</span>
        <div className="w-3.5 h-3.5 rounded bg-muted/60 border" />
        <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-500/20" />
        <div className="w-3 h-3 rounded bg-emerald-300 dark:bg-emerald-500/40" />
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <div className="w-3 h-3 rounded-full bg-emerald-700" />
        <span>More</span>
      </div>
    </div>
  );
}
