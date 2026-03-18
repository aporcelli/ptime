// components/pdf/ReporteTemplate.tsx
// Template PDF profesional con @react-pdf/renderer
"use client";

import {
    Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font
} from "@react-pdf/renderer";
import type { ReportData } from "@/types/api";

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 10,
        backgroundColor: "#F8FAFC",
        padding: 40,
    },
    header: {
        marginBottom: 24,
        borderBottom: "2px solid #1A56DB",
        paddingBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    brand: {
        fontSize: 28,
        fontFamily: "Helvetica-Bold",
        color: "#0D1117",
    },
    brandAccent: {
        color: "#F59E0B",
    },
    subtitle: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 2,
    },
    metaBlock: {
        textAlign: "right",
    },
    metaLabel: {
        fontSize: 8,
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    metaValue: {
        fontSize: 10,
        color: "#1C2333",
        fontFamily: "Helvetica-Bold",
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: "#0D1117",
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: "1px solid #E2E8F0",
    },
    kpiGrid: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    kpiCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 6,
        padding: 10,
        border: "1px solid #E2E8F0",
    },
    kpiLabel: {
        fontSize: 8,
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 3,
    },
    kpiValue: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: "#1A56DB",
    },
    table: {
        width: "100%",
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#0D1117",
        padding: "6 8",
        borderRadius: "4 4 0 0",
    },
    tableHeaderCell: {
        fontSize: 8,
        color: "#FFFFFF",
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1px solid #E2E8F0",
        padding: "5 8",
        backgroundColor: "#FFFFFF",
    },
    tableRowAlt: {
        backgroundColor: "#F8FAFC",
    },
    tableCell: {
        fontSize: 9,
        color: "#2D3748",
    },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 40,
        right: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        borderTop: "1px solid #E2E8F0",
        paddingTop: 8,
    },
    footerText: {
        fontSize: 8,
        color: "#94A3B8",
    },
});

// ── Document Component ────────────────────────────────────────────────────────
interface DocProps {
    data: ReportData;
    fechaDesde?: string;
    fechaHasta?: string;
    nombreEmpresa?: string;
    moneda?: string;
}

function ReporteDoc({ data, fechaDesde, fechaHasta, nombreEmpresa = "Ptime", moneda = "USD" }: DocProps) {
    const { kpis, porMes, porProyecto } = data;
    const now = new Date().toLocaleDateString("es-ES");

    const fmt = (n: number) =>
        `${moneda} ${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <Document title={`Reporte Ptime — ${now}`} author={nombreEmpresa}>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brand}>P<Text style={styles.brandAccent}>time</Text></Text>
                        <Text style={styles.subtitle}>Reporte de horas y facturación</Text>
                    </View>
                    <View style={styles.metaBlock}>
                        {fechaDesde && fechaHasta && (
                            <>
                                <Text style={styles.metaLabel}>Período</Text>
                                <Text style={styles.metaValue}>{fechaDesde} → {fechaHasta}</Text>
                            </>
                        )}
                        <Text style={[styles.metaLabel, { marginTop: 4 }]}>Generado</Text>
                        <Text style={styles.metaValue}>{now}</Text>
                    </View>
                </View>

                {/* KPIs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen ejecutivo</Text>
                    <View style={styles.kpiGrid}>
                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Total horas</Text>
                            <Text style={styles.kpiValue}>{kpis.totalHoras}h</Text>
                        </View>
                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Total ingresos</Text>
                            <Text style={[styles.kpiValue, { color: "#10B981" }]}>{fmt(kpis.totalIngresos)}</Text>
                        </View>
                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Promedio diario</Text>
                            <Text style={[styles.kpiValue, { color: "#F59E0B" }]}>{kpis.promedioHorasDia}h</Text>
                        </View>
                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Proyectos activos</Text>
                            <Text style={[styles.kpiValue, { color: "#8B5CF6" }]}>{kpis.proyectosActivos}</Text>
                        </View>
                    </View>
                </View>

                {/* Por mes */}
                {porMes.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Por mes</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Mes</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Horas</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Ingresos</Text>
                            </View>
                            {porMes.map((m, i) => (
                                <View key={m.mes} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                                    <Text style={[styles.tableCell, { flex: 2, fontFamily: "Helvetica-Bold" }]}>{m.mes}</Text>
                                    <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>{m.horas}h</Text>
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: "right", color: "#1A56DB" }]}>{fmt(m.ingresos)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Por proyecto */}
                {porProyecto.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Por proyecto</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Proyecto</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>Horas</Text>
                                <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Ingresos</Text>
                            </View>
                            {porProyecto.map((p, i) => (
                                <View key={p.nombre} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                                    <Text style={[styles.tableCell, { flex: 3 }]}>{p.nombre}</Text>
                                    <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>{p.horas}h</Text>
                                    <Text style={[styles.tableCell, { flex: 2, textAlign: "right", color: "#1A56DB" }]}>{fmt(p.ingresos)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Ptime — Documento confidencial</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
                        `Página ${pageNumber} de ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}

// ── Export button component ───────────────────────────────────────────────────
interface ButtonProps extends DocProps {
    className?: string;
}

export default function ReporteTemplate({ className = "", ...docProps }: ButtonProps) {
    const fileName = `reporte-ptime-${new Date().toISOString().slice(0, 10)}.pdf`;

    function handleDownload(url: string | null) {
        if (!url) return;
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
    }

    // Usamos PDFDownloadLink correctamente envolviendo con un anchor
    return (
        <PDFDownloadLink
            document={<ReporteDoc {...docProps} />}
            fileName={fileName}
        >
            <span className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:border-brand-600 text-ink text-sm font-medium transition-colors cursor-pointer ${className}`}>
                📄 Exportar PDF
            </span>
        </PDFDownloadLink>
    );
}
