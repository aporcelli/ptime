// components/shared/FilterBar.tsx
// Barra de filtros combinables para reportes y listados
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    placeholder?: string;
}

interface Props {
    filters: FilterConfig[];
    searchKey?: string;
    searchPlaceholder?: string;
}

export default function FilterBar({ filters, searchKey, searchPlaceholder = "Buscar…" }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    function updateParam(key: string, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }

    function clearAll() {
        startTransition(() => {
            router.push(pathname);
        });
    }

    const hasFilters = filters.some((f) => searchParams.get(f.key)) ||
        (searchKey && searchParams.get(searchKey));

    return (
        <div className={`flex flex-wrap gap-2 items-center transition-opacity ${isPending ? "opacity-60" : ""}`}>
            {/* Búsqueda de texto */}
            {searchKey && (
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    <input
                        type="text"
                        defaultValue={searchParams.get(searchKey) ?? ""}
                        onChange={(e) => updateParam(searchKey, e.target.value)}
                        placeholder={searchPlaceholder}
                        className="pl-8 pr-3 py-1.5 rounded-lg text-sm bg-surface-low text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-fixed/30 focus:bg-surface-lowest w-44 transition-colors"
                    />
                </div>
            )}

            {/* Selectores por filtro */}
            {filters.map((filter) => (
                <select
                    key={filter.key}
                    value={searchParams.get(filter.key) ?? ""}
                    onChange={(e) => updateParam(filter.key, e.target.value)}
                    className="py-1.5 px-3 rounded-lg text-sm bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30 cursor-pointer transition-colors"
                >
                    <option value="">{filter.placeholder ?? filter.label}</option>
                    {filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ))}

            {/* Limpiar filtros */}
            {hasFilters && (
                <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface rounded-lg px-2.5 py-1.5 transition-colors hover:bg-surface-high"
                >
                    <X size={12} /> Limpiar
                </button>
            )}
        </div>
    );
}
