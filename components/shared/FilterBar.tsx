// components/shared/FilterBar.tsx
// Barra de filtros combinables para reportes y listados con Shadcn
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function FilterBar({
  filters,
  searchKey,
  searchPlaceholder = "Buscar…",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
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

  const hasFilters =
    filters.some((f) => searchParams.get(f.key)) ||
    (searchKey && searchParams.get(searchKey));

  return (
    <div
      className={`flex flex-wrap gap-3 items-center transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      {/* Búsqueda de texto */}
      {searchKey && (
        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            type="text"
            defaultValue={searchParams.get(searchKey) ?? ""}
            onChange={(e) => updateParam(searchKey, e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {/* Selectores por filtro */}
      {filters.map((filter) => (
        <div key={filter.key} className="w-full sm:w-auto">
          <Select
            value={searchParams.get(filter.key) ?? "all"}
            onValueChange={(val) => updateParam(filter.key, val)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={filter.placeholder ?? filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.placeholder ?? filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Limpiar filtros */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-slate-500 h-9 px-3"
        >
          <X size={14} className="mr-2" /> Limpiar filtros
        </Button>
      )}
    </div>
  );
}
