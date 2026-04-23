// components/admin/PresupuestoBar.tsx
// Progress bar semafórico para presupuesto de proyecto
// Verde <80% | Amber 80-99% | Rojo 100%+
"use client";

interface PresupuestoBarProps {
  horasRegistradas: number;
  presupuestoHoras: number;
  showLabel?: boolean;
}

export function PresupuestoBar({
  horasRegistradas,
  presupuestoHoras,
  showLabel = true,
}: PresupuestoBarProps) {
  if (!presupuestoHoras || presupuestoHoras <= 0) return null;

  const pct = Math.min(
    Math.round((horasRegistradas / presupuestoHoras) * 100),
    100
  );

  const barColor =
    pct >= 100 ? "bg-red-500" :
    pct >= 80  ? "bg-amber-400" :
                 "bg-primary-fixed";

  return (
    <div className="space-y-1 w-full" title={`Presupuesto: ${pct}% (${horasRegistradas}h de ${presupuestoHoras}h)`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-on-surface-variant">
          <span className="tabular-nums">
            {horasRegistradas}h / {presupuestoHoras}h
          </span>
          <span className="tabular-nums font-medium">{pct}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full rounded-full bg-surface-highest overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
