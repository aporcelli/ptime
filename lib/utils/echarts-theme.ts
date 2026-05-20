export type DashboardTheme = "light" | "dark";

export function getEchartsTheme(theme: DashboardTheme) {
  if (theme === "dark") {
    return {
      text: "#DDE3EB",
      muted: "#8FA3B8",
      grid: "#2E3740",
      axisLine: "#3A4652",
      tooltipBg: "#111827",
      tooltipBorder: "#374151",
      splitArea: "rgba(255,255,255,0.02)",
      palette: ["#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#22D3EE", "#F87171"],
    };
  }

  return {
    text: "#181C1E",
    muted: "#6F7B88",
    grid: "#C4C6CD",
    axisLine: "#D3D6DD",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E5E7EB",
    splitArea: "rgba(0,0,0,0.015)",
    palette: ["#2563EB", "#059669", "#D97706", "#7C3AED", "#0891B2", "#DC2626"],
  };
}
