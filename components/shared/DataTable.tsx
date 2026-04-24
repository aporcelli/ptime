// components/shared/DataTable.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  mobileLabel?: string;
}

interface Props<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

type SortDir = "asc" | "desc" | null;

export default function DataTable<T extends { id: string }>({
  columns, data, emptyMessage = "Sin registros", onRowClick, actions,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(key: string) {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); return; }
    if (sortDir === "asc") setSortDir("desc");
    else { setSortKey(null); setSortDir(null); }
  }

  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (av === bv) return 0;
      const cmp = av! < bv! ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  function getCellValue(row: T, col: Column<T>) {
    if (col.render) return col.render(row);
    return (row as Record<string, unknown>)[col.key as string] ?? "—";
  }

  if (data.length === 0) {
    return (
      <div className="bg-muted/30 rounded-xl p-10 text-center border border-dashed border-border">
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.sortable ? "cursor-pointer select-none hover:text-foreground" : "",
                  )}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </TableHead>
              ))}
              {actions && <TableHead className="w-[80px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow
                key={row.id}
                className={cn("transition-colors", onRowClick ? "cursor-pointer" : "")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={cn(
                      "py-3 text-foreground",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "",
                      col.className
                    )}
                  >
                    {getCellValue(row, col) as React.ReactNode}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {sorted.map((row) => (
          <div
            key={row.id}
            className={cn(
              "bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm",
              onRowClick ? "cursor-pointer active:bg-accent" : ""
            )}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={String(col.key)} className="flex items-start justify-between gap-4">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider shrink-0 mt-0.5">
                  {col.mobileLabel ?? col.header}
                </span>
                <span className={cn("text-sm text-right text-foreground font-medium", col.className)}>
                  {getCellValue(row, col) as React.ReactNode}
                </span>
              </div>
            ))}
            {actions && (
              <div className="flex justify-end pt-2 mt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                {actions(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
