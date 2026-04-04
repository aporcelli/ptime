// lib/utils/chart-colors.ts
// Paleta Meridian para Recharts
// SVG attrs no pueden consumir CSS vars — centralizamos aquí para O(1) cambios
export const CHART_COLORS = [
  "#009944", // primary-fixed (teal)
  "#041627", // primary (navy)
  "#1a2b3c", // primary-container
  "#F59E0B", // warm amber
  "#8B5CF6", // purple accent
  "#06B6D4", // cyan
  "#EF4444", // red/danger
  "#F97316", // orange
] as const;

export type ChartColor = (typeof CHART_COLORS)[number];
