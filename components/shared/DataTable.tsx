// components/shared/DataTable.tsx
// Tabla de datos responsiva: tabla en desktop, cards en móvil
"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (row: T) => React.ReactNode;
    sortable?: boolean;
    align?: "left" | "right" | "center";
    className?: string;
    mobileLabel?: string; // etiqueta en vista card (mobile)
}

interface Props<T extends { id: string }> {
    columns: Column<T>[];
    data: T[];
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
}

type SortDir = "asc" | "desc" | null;

export default function DataTable<T extends { id: string }>({
    columns,
    data,
    emptyMessage = "Sin registros",
    onRowClick,
}: Props<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>(null);

    function handleSort(key: string) {
        if (sortKey !== key) { setSortKey(key); setSortDir("asc"); return; }
        if (sortDir === "asc") setSortDir("desc");
        else { setSortKey(null); setSortDir(null); }
    }

    const sorted = [...data].sort((a, b) => {
        if (!sortKey || !sortDir) return 0;
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        if (av === bv) return 0;
        const cmp = av < bv ? -1 : 1;
        return sortDir === "asc" ? cmp : -cmp;
    });

    function getCellValue(row: T, col: Column<T>) {
        if (col.render) return col.render(row);
        return (row as any)[col.key] ?? "—";
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <p className="text-slate-400 text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {columns.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        className={`p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap
                      ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}
                      ${col.sortable ? "cursor-pointer select-none hover:text-ink" : ""}
                      ${col.className ?? ""}`}
                                        onClick={() => col.sortable && handleSort(String(col.key))}
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {col.header}
                                            {col.sortable && sortKey === String(col.key) && (
                                                sortDir === "asc"
                                                    ? <ChevronUp size={12} />
                                                    : <ChevronDown size={12} />
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors
                    ${onRowClick ? "cursor-pointer" : ""}`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={String(col.key)}
                                            className={`p-3 text-ink
                        ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}
                        ${col.className ?? ""}`}
                                        >
                                            {getCellValue(row, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
                {sorted.map((row) => (
                    <div
                        key={row.id}
                        className={`bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2
              ${onRowClick ? "cursor-pointer active:bg-slate-50" : ""}`}
                        onClick={() => onRowClick?.(row)}
                    >
                        {columns.map((col) => (
                            <div key={String(col.key)} className="flex items-start justify-between gap-2">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide shrink-0">
                                    {col.mobileLabel ?? col.header}
                                </span>
                                <span className={`text-sm text-right ${col.className ?? ""}`}>
                                    {getCellValue(row, col)}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}
