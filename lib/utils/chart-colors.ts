// lib/utils/chart-colors.ts
// Palette driven by semantic CSS tokens (light/dark aware)
// Recharts accepts CSS color functions in SVG attrs.
export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
] as const;

export const CHART_GRID_COLOR = "hsl(var(--chart-grid))";
export const CHART_TICK_COLOR = "hsl(var(--muted-foreground))";

export type ChartColor = (typeof CHART_COLORS)[number];
