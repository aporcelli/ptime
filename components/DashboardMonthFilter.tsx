// components/DashboardMonthFilter.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatMonthShort } from "@/lib/utils/index";

interface Props {
  months: string[]; // List of unique "YYYY-MM" strings
  selectedMonth: string;
}

export default function DashboardMonthFilter({ months, selectedMonth }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("mes", val);
    } else {
      params.delete("mes");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="dashboard-month-select" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Período:
      </label>
      <select
        id="dashboard-month-select"
        value={selectedMonth}
        onChange={handleChange}
        className="
          bg-card border border-border rounded-lg px-3 py-1.5
          text-foreground text-sm font-medium
          focus:outline-none focus:ring-2 focus:ring-primary/20
        "
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthShort(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
