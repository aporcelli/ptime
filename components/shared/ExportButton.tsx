// components/shared/ExportButton.tsx
// Botón de exportación CSV y PDF
"use client";

import { useState } from "react";
import { Download, FileText, Table2, Loader2 } from "lucide-react";

interface CsvRow {
    [key: string]: string | number | boolean;
}

interface Props {
    csvData?: CsvRow[];
    csvFilename?: string;
    onExportPdf?: () => Promise<void> | void;
    label?: string;
    disabled?: boolean;
}

/** Convierte array de objetos a string CSV y dispara descarga */
function downloadCsv(data: CsvRow[], filename: string) {
    if (!data?.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
        headers.map((h) => {
            const val = row[h];
            const str = val == null ? "" : String(val);
            // Escapar comas y comillas
            return str.includes(",") || str.includes('"') || str.includes("\n")
                ? `"${str.replace(/"/g, '""')}"`
                : str;
        }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM para Excel
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

export default function ExportButton({
    csvData,
    csvFilename = "reporte-ptime",
    onExportPdf,
    label = "Exportar",
    disabled = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState<"csv" | "pdf" | null>(null);

    async function handleCsv() {
        if (!csvData?.length) return;
        setLoading("csv");
        downloadCsv(csvData, csvFilename);
        setLoading(null);
        setOpen(false);
    }

    async function handlePdf() {
        if (!onExportPdf) return;
        setLoading("pdf");
        await onExportPdf();
        setLoading(null);
        setOpen(false);
    }

    const hasCsv = !!csvData?.length;
    const hasPdf = !!onExportPdf;

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                disabled={disabled || (!hasCsv && !hasPdf)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:border-brand-600 text-ink text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Download size={14} />
                {label}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        {hasCsv && (
                            <button
                                onClick={handleCsv}
                                disabled={loading === "csv"}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {loading === "csv" ? <Loader2 size={14} className="animate-spin" /> : <Table2 size={14} className="text-green-600" />}
                                Exportar CSV
                            </button>
                        )}
                        {hasPdf && (
                            <button
                                onClick={handlePdf}
                                disabled={loading === "pdf"}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-ink hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {loading === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} className="text-red-500" />}
                                Exportar PDF
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
