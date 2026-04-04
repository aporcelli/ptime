// components/pdf/ReporteTemplate.tsx
// PDF profesional para reporte de horas — paleta Meridian
// Gráficos SVG nativos (react-pdf soporta SVG sin dependencias externas)
"use client";

import {
  Document, Page, Text, View, StyleSheet, Image, Link,
  PDFDownloadLink, Svg, Rect, Circle, G, Path, Line as PdfLine, Polyline
} from "@react-pdf/renderer";
import type { ReportData } from "@/types/api";

// ── Paleta Meridian (valores estáticos — react-pdf no lee CSS vars) ───────────
const C = {
  primary:    "#041627",  // navy
  teal:       "#009944",  // primary-fixed
  tealLight:  "#e6f4ec",
  navy2:      "#1a2b3c",  // primary-container
  surface:    "#f7fafc",
  surfaceLow: "#f1f4f6",
  surfaceHigh:"#ebf0f2",
  white:      "#ffffff",
  onSurface:  "#181c1e",
  muted:      "#6f7b88",
  outline:    "#c4c6cd",
  amber:      "#F59E0B",
  amberLight: "#fffbeb",
  purple:     "#8B5CF6",
  cyan:       "#06B6D4",
  red:        "#EF4444",
  orange:     "#F97316",
};

// Colores de gráficos (mismo orden que CHART_COLORS)
const CHART = [C.teal, C.primary, C.navy2, C.amber, C.purple, C.cyan, C.red, C.orange];

// ── Estilos ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    backgroundColor: C.surface,
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 0,
  },

  // ── Header banda superior
  headerBand: {
    backgroundColor: C.primary,
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandName: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: C.white,
    letterSpacing: -0.5,
  },
  brandAccent: { color: C.teal },
  brandTagline: { fontSize: 10, color: "#9bbcdc", marginTop: 3 },

  metaBlock: { alignItems: "flex-end", gap: 2 },
  metaChip: {
    backgroundColor: "#1a2b3c",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    alignItems: "flex-end",
  },
  metaLabel: { fontSize: 7, color: "#9bbcdc", textTransform: "uppercase", letterSpacing: 0.8 },
  metaValue: { fontSize: 9, color: C.white, fontFamily: "Helvetica-Bold" },

  // ── Teal accent stripe bajo header
  accentStripe: {
    height: 3,
    backgroundColor: C.teal,
  },

  // ── Body content
  body: { paddingHorizontal: 40, paddingTop: 24 },

  // ── Secciones
  section: { marginBottom: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.teal,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // ── KPI Grid
  kpiGrid: { flexDirection: "row", gap: 8 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 6,
    padding: 10,
    borderLeft: `3px solid ${C.teal}`,
  },
  kpiCardAmber:  { borderLeft: `3px solid ${C.amber}` },
  kpiCardPurple: { borderLeft: `3px solid ${C.purple}` },
  kpiCardNavy:   { borderLeft: `3px solid ${C.navy2}` },
  kpiLabel: { fontSize: 7, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  kpiValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.teal },
  kpiValueAmber:  { color: C.amber },
  kpiValuePurple: { color: C.purple },
  kpiValueNavy:   { color: C.primary },
  kpiSub: { fontSize: 7, color: C.muted, marginTop: 2 },

  // ── Tabla
  table: { width: "100%", borderRadius: 6, overflow: "hidden" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tableHeaderCell: {
    fontSize: 7,
    color: C.white,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: C.white,
    borderBottom: `1px solid ${C.surfaceHigh}`,
  },
  tableRowAlt: { backgroundColor: C.surfaceLow },
  tableCell: { fontSize: 8.5, color: C.onSurface },
  tableCellMuted: { color: C.muted },
  tableCellAccent: { color: C.teal, fontFamily: "Helvetica-Bold" },

  // ── Detalle de registros
  registroRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottom: `1px solid ${C.surfaceHigh}`,
  },

  // ── Alert box
  alertBox: {
    backgroundColor: C.amberLight,
    borderLeft: `3px solid ${C.amber}`,
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  alertText: { fontSize: 8.5, color: "#92400e" },
  alertBold: { fontFamily: "Helvetica-Bold" },

  // ── Chart containers
  chartBox: {
    backgroundColor: C.white,
    borderRadius: 6,
    padding: 14,
  },
  chartTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.primary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Charts side by side
  chartsRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  chartHalf: { flex: 1 },

  // ── Leyenda del pie
  legendRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontSize: 7.5, color: C.onSurface, flex: 1 },
  legendValue: { fontSize: 7.5, color: C.muted, fontFamily: "Helvetica-Bold" },

  // ── Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.primary,
    paddingHorizontal: 40,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontSize: 7.5, color: "#9bbcdc" },
  footerAccent: { color: C.teal, fontFamily: "Helvetica-Bold" },
  
  // ── TuCloud Logos
  headerLogo: { height: 16, width: "auto", marginLeft: 12 },
  footerLogo: { height: 10, width: "auto", marginLeft: 6 },
});

// ── Helpers de formato ────────────────────────────────────────────────────────
function fmt(n: number, moneda = "USD") {
  return `${moneda} ${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtH(n: number) { return `${n % 1 === 0 ? n : n.toFixed(1)}h`; }

// ── SVG Bar Chart ─────────────────────────────────────────────────────────────
// react-pdf soporta SVG nativo vía <Svg>, <Rect>, <Text> etc.
function BarChartSvg({ data, width = 230, height = 120, moneda = "USD" }: {
  data: Array<{ label: string; value: number; value2?: number }>;
  width?: number;
  height?: number;
  moneda?: string;
}) {
  if (!data.length) return null;

  const padLeft = 8;
  const padBottom = 28;
  const padTop = 8;
  const padRight = 8;
  const chartW = width - padLeft - padRight;
  const chartH = height - padBottom - padTop;

  const maxVal = Math.max(...data.flatMap(d => [d.value, d.value2 ?? 0]), 1);
  const barGroupW = chartW / data.length;
  const hasValue2 = data.some(d => d.value2 !== undefined);
  const barW = hasValue2 ? (barGroupW * 0.38) : (barGroupW * 0.55);
  const gap = hasValue2 ? (barGroupW * 0.06) : 0;

  // Líneas de grilla (3)
  const gridLines = [0.25, 0.5, 0.75, 1].map(pct => ({
    y: padTop + chartH * (1 - pct),
    val: maxVal * pct,
  }));

  return (
    <Svg width={width} height={height}>
      {/* Grid lines */}
      {gridLines.map((g, i) => (
        <G key={i}>
          <PdfLine
            x1={padLeft} y1={g.y}
            x2={padLeft + chartW} y2={g.y}
            stroke={C.surfaceHigh} strokeWidth={0.5}
          />
        </G>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const groupX = padLeft + i * barGroupW + barGroupW * 0.05;
        const barH = (d.value / maxVal) * chartH;
        const barY = padTop + chartH - barH;

        return (
          <G key={i}>
            {/* Bar principal */}
            <Rect
              x={groupX}
              y={barY}
              width={barW}
              height={barH}
              fill={C.teal}
              rx={2}
            />
            {/* Bar secundaria (value2) */}
            {hasValue2 && d.value2 !== undefined && d.value2 > 0 && (
              <Rect
                x={groupX + barW + gap}
                y={padTop + chartH - (d.value2 / maxVal) * chartH}
                width={barW}
                height={(d.value2 / maxVal) * chartH}
                fill={C.navy2}
                rx={2}
              />
            )}
            {/* Label eje X */}
            <Text
              x={groupX + (hasValue2 ? barW + gap / 2 : barW / 2)}
              y={padTop + chartH + 10}
              style={{ fontSize: 6, fill: C.muted, textAnchor: "middle" } as any}
            >
              {d.label.length > 8 ? d.label.slice(0, 7) + "…" : d.label}
            </Text>
          </G>
        );
      })}

      {/* Baseline */}
      <PdfLine
        x1={padLeft} y1={padTop + chartH}
        x2={padLeft + chartW} y2={padTop + chartH}
        stroke={C.outline} strokeWidth={0.8}
      />
    </Svg>
  );
}

// ── SVG Pie Chart ─────────────────────────────────────────────────────────────
function PieChartSvg({ data, size = 100 }: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}) {
  if (!data.length) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let currentAngle = -Math.PI / 2; // empezar desde arriba

  const slices = data.map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { ...d, pathD, pct: Math.round((d.value / total) * 100) };
  });

  return (
    <Svg width={size} height={size}>
      {slices.map((slice, i) => (
        <Path key={i} d={slice.pathD} fill={slice.color} />
      ))}
      {/* Donut hole */}
      <Circle cx={cx} cy={cy} r={r * 0.42} fill={C.white} />
    </Svg>
  );
}

// ── Document Principal ────────────────────────────────────────────────────────
interface DocProps {
  data: ReportData;
  fechaDesde?: string;
  fechaHasta?: string;
  nombreEmpresa?: string;
  moneda?: string;
  registros?: Array<{
    fecha: string;
    descripcion: string;
    proyectoNombre: string;
    horas: number;
    precioHora: number;
    total: number;
    estado: string;
  }>;
  clienteNombre?: string;
  tituloReporte?: string;  // nuevo
}

function ReporteDoc({
  data,
  fechaDesde,
  fechaHasta,
  nombreEmpresa = "Ptime",
  moneda = "USD",
  registros = [],
  clienteNombre,
  tituloReporte,
}: DocProps) {
  const { kpis, porMes, porProyecto, porTarea, alertasTramo2 } = data;
  const now = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

  // Datos para el bar chart (por proyecto — top 6)
  const barData = porProyecto.slice(0, 6).map(p => ({
    label: p.nombre,
    value: p.horas,
    value2: undefined as number | undefined,
  }));

  // Datos para el pie (por tarea — top 6)
  const pieData = porTarea.slice(0, 6).map((t, i) => ({
    label: t.nombre,
    value: t.horas,
    color: CHART[i % CHART.length],
  }));

  const promedioHora = kpis.totalHoras > 0
    ? kpis.totalIngresos / kpis.totalHoras
    : 0;

  return (
    <Document
      title={`Reporte Ptime — ${fechaDesde ?? ""}${fechaHasta ? " → " + fechaHasta : ""}`}
      author={nombreEmpresa}
      subject="Reporte de horas y facturación"
      creator="Ptime"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header banda navy ── */}
        <View style={s.headerBand}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={s.brandName}>
                P<Text style={s.brandAccent}>time</Text>
              </Text>
              <View style={{ height: 20, width: 1, backgroundColor: C.outline, opacity: 0.3, marginHorizontal: 12 }} />
              <Link src="https://tucloud.pro">
                <Image src="/logo_tucloud_white.png" style={s.headerLogo} />
              </Link>
            </View>
            {/* Título personalizado */}
            <Text style={[s.brandTagline, { fontSize: 13, color: C.white, fontFamily: "Helvetica-Bold", marginTop: 4 }]}>
              {tituloReporte ?? "Reporte de horas y facturación"}
            </Text>
            {clienteNombre && (
              <Text style={[s.brandTagline, { color: C.teal, marginTop: 3 }]}>
                Cliente: {clienteNombre}
              </Text>
            )}
          </View>
          <View style={s.metaBlock}>
            {fechaDesde && fechaHasta && (
              <View style={s.metaChip}>
                <Text style={s.metaLabel}>Período</Text>
                <Text style={s.metaValue}>{fechaDesde} → {fechaHasta}</Text>
              </View>
            )}
            <View style={s.metaChip}>
              <Text style={s.metaLabel}>Generado</Text>
              <Text style={s.metaValue}>{now}</Text>
            </View>
            <View style={s.metaChip}>
              <Text style={s.metaLabel}>Registros</Text>
              <Text style={s.metaValue}>{kpis.registrosTotales}</Text>
            </View>
          </View>
        </View>

        {/* Stripe teal bajo header */}
        <View style={s.accentStripe} />

        <View style={s.body}>

          {/* ── KPIs ── */}
          <View style={[s.section, { marginTop: 20 }]}>
            <View style={s.sectionHeader}>
              <View style={s.sectionDot} />
              <Text style={s.sectionTitle}>Resumen ejecutivo</Text>
            </View>
            <View style={s.kpiGrid}>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Total horas</Text>
                <Text style={s.kpiValue}>{fmtH(kpis.totalHoras)}</Text>
                <Text style={s.kpiSub}>{kpis.registrosTotales} registros</Text>
              </View>
              <View style={[s.kpiCard, { borderLeft: `3px solid ${C.teal}` }]}>
                <Text style={s.kpiLabel}>Total facturado</Text>
                <Text style={[s.kpiValue, { fontSize: 14 }]}>{fmt(kpis.totalIngresos, moneda)}</Text>
                <Text style={s.kpiSub}>en el período</Text>
              </View>
              <View style={[s.kpiCard, s.kpiCardAmber]}>
                <Text style={s.kpiLabel}>Promedio $/h</Text>
                <Text style={[s.kpiValue, s.kpiValueAmber, { fontSize: 14 }]}>{fmt(promedioHora, moneda)}</Text>
                <Text style={s.kpiSub}>tarifa efectiva</Text>
              </View>
              <View style={[s.kpiCard, s.kpiCardPurple]}>
                <Text style={s.kpiLabel}>Proyectos</Text>
                <Text style={[s.kpiValue, s.kpiValuePurple]}>{kpis.proyectosActivos}</Text>
                <Text style={s.kpiSub}>involucrados</Text>
              </View>
            </View>
          </View>

          {/* ── Alertas tramo 2 ── */}
          {alertasTramo2.length > 0 && (
            <View style={s.alertBox}>
              <Text style={[s.alertText, s.alertBold]}>⚠ Proyectos en tramo precio alto: </Text>
              <Text style={s.alertText}>
                {alertasTramo2.map(a => `${a.nombre} (${a.horasAcumuladas}h / umbral ${a.umbral}h)`).join("  ·  ")}
              </Text>
            </View>
          )}

          {/* ── Gráficos lado a lado ── */}
          {(barData.length > 0 || pieData.length > 0) && (
            <View style={[s.section]}>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Análisis visual</Text>
              </View>
              <View style={s.chartsRow}>
                {/* Bar chart — horas por proyecto */}
                {barData.length > 0 && (
                  <View style={[s.chartHalf, s.chartBox]}>
                    <Text style={s.chartTitle}>Horas por proyecto</Text>
                    <BarChartSvg data={barData} width={220} height={110} moneda={moneda} />
                    {/* Leyenda colores */}
                    <View style={{ flexDirection: "row", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: C.teal }} />
                        <Text style={{ fontSize: 6.5, color: C.muted }}>Horas</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Pie chart — distribución por tarea */}
                {pieData.length > 0 && (
                  <View style={[s.chartHalf, s.chartBox]}>
                    <Text style={s.chartTitle}>Distribución por tarea</Text>
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                      <PieChartSvg data={pieData} size={88} />
                      <View style={{ flex: 1 }}>
                        {pieData.map((d, i) => (
                          <View key={i} style={s.legendRow}>
                            <View style={[s.legendDot, { backgroundColor: d.color }]} />
                            <Text style={s.legendLabel}>
                              {d.label.length > 14 ? d.label.slice(0, 13) + "…" : d.label}
                            </Text>
                            <Text style={s.legendValue}>{fmtH(d.value)}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Tabla por proyecto ── */}
          {porProyecto.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Detalle por proyecto</Text>
              </View>
              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { flex: 3 }]}>Proyecto</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>Horas</Text>
                  <Text style={[s.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Facturado</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>$/h</Text>
                </View>
                {porProyecto.map((p, i) => {
                  const avg = p.horas > 0 ? p.ingresos / p.horas : 0;
                  return (
                    <View key={p.nombre} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                      <Text style={[s.tableCell, { flex: 3, fontFamily: "Helvetica-Bold" }]}>{p.nombre}</Text>
                      <Text style={[s.tableCell, s.tableCellMuted, { flex: 1.2, textAlign: "right" }]}>{fmtH(p.horas)}</Text>
                      <Text style={[s.tableCell, s.tableCellAccent, { flex: 2, textAlign: "right" }]}>{fmt(p.ingresos, moneda)}</Text>
                      <Text style={[s.tableCell, s.tableCellMuted, { flex: 1.2, textAlign: "right" }]}>{avg.toFixed(0)}</Text>
                    </View>
                  );
                })}
                {/* Total row */}
                <View style={[s.tableRow, { backgroundColor: C.surfaceHigh }]}>
                  <Text style={[s.tableCell, { flex: 3, fontFamily: "Helvetica-Bold" }]}>TOTAL</Text>
                  <Text style={[s.tableCell, { flex: 1.2, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>{fmtH(kpis.totalHoras)}</Text>
                  <Text style={[s.tableCell, s.tableCellAccent, { flex: 2, textAlign: "right", fontFamily: "Helvetica-Bold" }]}>{fmt(kpis.totalIngresos, moneda)}</Text>
                  <Text style={[s.tableCell, { flex: 1.2, textAlign: "right" }]}>{promedioHora.toFixed(0)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Tabla por mes ── */}
          {porMes.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Evolución mensual</Text>
              </View>
              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>Mes</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Horas</Text>
                  <Text style={[s.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Facturado</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1.5, textAlign: "right" }]}>% del total</Text>
                </View>
                {[...porMes].reverse().map((m, i) => {
                  const pct = kpis.totalIngresos > 0
                    ? Math.round((m.ingresos / kpis.totalIngresos) * 100)
                    : 0;
                  return (
                    <View key={m.mes} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                      <Text style={[s.tableCell, { flex: 2, fontFamily: "Helvetica-Bold" }]}>{m.mes}</Text>
                      <Text style={[s.tableCell, s.tableCellMuted, { flex: 1, textAlign: "right" }]}>{fmtH(m.horas)}</Text>
                      <Text style={[s.tableCell, s.tableCellAccent, { flex: 2, textAlign: "right" }]}>{fmt(m.ingresos, moneda)}</Text>
                      <Text style={[s.tableCell, s.tableCellMuted, { flex: 1.5, textAlign: "right" }]}>{pct}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* ── Detalle de registros (si se pasan) ── */}
          {registros.length > 0 && (
            <View style={s.section} break>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Detalle de registros ({registros.length})</Text>
              </View>
              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, { flex: 1.2 }]}>Fecha</Text>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>Proyecto</Text>
                  <Text style={[s.tableHeaderCell, { flex: 3 }]}>Descripción</Text>
                  <Text style={[s.tableHeaderCell, { flex: 0.8, textAlign: "right" }]}>Horas</Text>
                  <Text style={[s.tableHeaderCell, { flex: 0.8, textAlign: "right" }]}>$/h</Text>
                  <Text style={[s.tableHeaderCell, { flex: 1.5, textAlign: "right" }]}>Total</Text>
                </View>
                {registros.map((r, i) => (
                  <View key={i} style={[s.registroRow, i % 2 === 1 ? s.tableRowAlt : { backgroundColor: C.white }]}>
                    <Text style={[s.tableCell, s.tableCellMuted, { flex: 1.2 }]}>{r.fecha}</Text>
                    <Text style={[s.tableCell, { flex: 2 }]}>
                      {r.proyectoNombre.length > 20 ? r.proyectoNombre.slice(0, 19) + "…" : r.proyectoNombre}
                    </Text>
                    <Text style={[s.tableCell, s.tableCellMuted, { flex: 3 }]}>
                      {r.descripcion.length > 45 ? r.descripcion.slice(0, 44) + "…" : r.descripcion}
                    </Text>
                    <Text style={[s.tableCell, { flex: 0.8, textAlign: "right" }]}>{r.horas}h</Text>
                    <Text style={[s.tableCell, s.tableCellMuted, { flex: 0.8, textAlign: "right" }]}>${r.precioHora}</Text>
                    <Text style={[s.tableCell, s.tableCellAccent, { flex: 1.5, textAlign: "right" }]}>{fmt(r.total, moneda)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </View>

        {/* ── Footer banda navy ── */}
        <View style={s.footer} fixed>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={s.footerText}>
              <Text style={s.footerAccent}>Ptime</Text> — Documento confidencial · {nombreEmpresa}
            </Text>
            <View style={{ height: 8, width: 1, backgroundColor: C.outline, opacity: 0.3, marginHorizontal: 8 }} />
            <Text style={s.footerText}>Powered by</Text>
            <Link src="https://tucloud.pro">
              <Image src="/logo_tucloud_white.png" style={s.footerLogo} />
            </Link>
          </View>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
}

// ── Botón de descarga ─────────────────────────────────────────────────────────
interface ButtonProps extends DocProps {
  className?: string;
  label?: string;
  tituloReporte?: string;  // nuevo
}

export default function ReporteTemplate({ className = "", label = "Exportar PDF", ...docProps }: ButtonProps) {
  const period = docProps.fechaDesde && docProps.fechaHasta
    ? `${docProps.fechaDesde}_${docProps.fechaHasta}`
    : new Date().toISOString().slice(0, 10);
  const fileName = `reporte-ptime-${period}.pdf`;

  return (
    <PDFDownloadLink
      document={<ReporteDoc {...docProps} />}
      fileName={fileName}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-primary text-white hover:bg-primary-container ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {label}
    </PDFDownloadLink>
  );
}
