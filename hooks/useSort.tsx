// hooks/useSort.ts
"use client";

import { useState, useMemo } from "react";

export type SortDir = "asc" | "desc";

export function useSort<T>(items: T[], defaultKey: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "string" && typeof vb === "string") {
        return va.localeCompare(vb, undefined, { sensitivity: "base" }) * dir;
      }
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * dir;
      }
      if (typeof va === "boolean" && typeof vb === "boolean") {
        return (va === vb ? 0 : va ? -1 : 1) * dir;
      }
      return 0;
    });
  }, [items, sortKey, sortDir]);

  function toggle(key: keyof T) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortHeader({ colKey, label }: { colKey: keyof T; label: string }) {
    return (
      <th
        onClick={() => toggle(colKey)}
        className="p-3 text-xs font-semibold uppercase tracking-wide text-left cursor-pointer hover:text-foreground select-none"
        style={{ color: sortKey === colKey ? "var(--text-foreground)" : "var(--text-muted)" }}
      >
        <span className="flex items-center gap-1">
          {label}
          {sortKey === colKey && (
            <span className="text-[10px]">{sortDir === "asc" ? "▲" : "▼"}</span>
          )}
        </span>
      </th>
    );
  }

  return { sorted, SortHeader, sortKey, sortDir };
}
