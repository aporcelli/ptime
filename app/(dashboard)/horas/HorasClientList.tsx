"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Edit2, Eye, Trash2, TrendingUp } from "lucide-react";
import { formatCurrency, formatDateShort, formatHours, formatMonthShort } from "@/lib/utils/index";
import type { Cliente, PricingConfig, RegistroHoras, Proyecto, Tarea } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteHourAction, markMonthAsInvoiced } from "@/app/actions/hours";
import {
  getFilteredRecords,
  getMonthInvoiceSummary,
  repriceMonthlyRecords,
  resolveMonthFilter,
  summarizeRecords,
  type ClientFilter,
  type MonthFilter,
} from "@/lib/hours/monthly";
import { convertUsdToArs, parseExchangeRateInput } from "@/lib/hours/currency";

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  borrador: "secondary",
  confirmado: "default",
  facturado: "outline",
  rechazado: "destructive",
};

const DOLAR_RATE_STORAGE_KEY = "ptime-dolar-rate-ars";
const ESTADOS = ["borrador", "confirmado", "facturado", "rechazado"] as const;
type Estado = (typeof ESTADOS)[number];

interface Props {
  registros: RegistroHoras[];
  proyectosMap: Record<string, Proyecto>;
  tareasMap: Record<string, Tarea>;
  clientesMap: Record<string, Cliente>;
  fallbackConfig: PricingConfig;
}

export function HorasClientList({ registros, proyectosMap, tareasMap, clientesMap, fallbackConfig }: Props) {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState<Estado | null>(null);
  const [monthFilter, setMonthFilter] = useState<MonthFilter>("latest");
  const [clientFilter, setClientFilter] = useState<ClientFilter>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dolarRateInput, setDolarRateInput] = useState("");
  const [bnaRate, setBnaRate] = useState<{ venta: number; fecha?: string; fetchedAt?: string } | null>(null);
  const [bnaError, setBnaError] = useState<string | null>(null);
  const [bnaLoading, setBnaLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const repricedRecords = useMemo(
    () => repriceMonthlyRecords(registros, proyectosMap, fallbackConfig),
    [registros, proyectosMap, fallbackConfig],
  );

  const clientOptions = useMemo(
    () => Object.values(clientesMap).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [clientesMap],
  );

  const selectedMonth = useMemo(() => resolveMonthFilter(repricedRecords, monthFilter), [repricedRecords, monthFilter]);
  const baseFiltered = useMemo(() => getFilteredRecords(repricedRecords, monthFilter, clientFilter), [repricedRecords, monthFilter, clientFilter]);
  const summary = useMemo(() => summarizeRecords(baseFiltered), [baseFiltered]);
  const invoiceSummary = useMemo(
    () => (selectedMonth ? getMonthInvoiceSummary(repricedRecords, selectedMonth) : null),
    [repricedRecords, selectedMonth],
  );

  const filtrados = useMemo(() => {
    if (!filtroEstado) return baseFiltered;
    return baseFiltered.filter((r) => r.estado === filtroEstado);
  }, [baseFiltered, filtroEstado]);

  const canInvoiceMonth = monthFilter !== "all" && clientFilter === "all" && !!invoiceSummary && invoiceSummary.eligibleCount > 0;
  const dolarRate = useMemo(() => parseExchangeRateInput(dolarRateInput), [dolarRateInput]);
  const totalArs = useMemo(() => convertUsdToArs(summary.totalAmount, dolarRate), [summary.totalAmount, dolarRate]);
  const clientLabel = clientFilter === "all" ? "Todos los clientes" : (clientesMap[clientFilter]?.nombre ?? "Cliente");
  const monthLabel = selectedMonth ? formatMonthShort(selectedMonth) : "Todos los meses";

  useEffect(() => {
    setDolarRateInput(window.localStorage.getItem(DOLAR_RATE_STORAGE_KEY) ?? "");
  }, []);

  useEffect(() => {
    let active = true;
    setBnaLoading(true);
    fetch("/api/bna-dolar")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error ?? "No se pudo consultar BNA");
        if (active) {
          setBnaRate({ venta: data.venta, fecha: data.fecha, fetchedAt: data.fetchedAt });
          setBnaError(null);
        }
      })
      .catch((error) => {
        if (active) setBnaError(error instanceof Error ? error.message : "No se pudo consultar BNA");
      })
      .finally(() => {
        if (active) setBnaLoading(false);
      });
    return () => { active = false; };
  }, []);

  function handleDolarRateChange(value: string) {
    setDolarRateInput(value);
    if (value.trim()) window.localStorage.setItem(DOLAR_RATE_STORAGE_KEY, value);
    else window.localStorage.removeItem(DOLAR_RATE_STORAGE_KEY);
  }

  function useBnaRate() {
    if (!bnaRate) return;
    handleDolarRateChange(String(bnaRate.venta).replace(".", ","));
  }

  function handleMarkMonth() {
    if (!selectedMonth) return;
    setError(null);
    startTransition(async () => {
      const result = await markMonthAsInvoiced(selectedMonth);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  function handleDeleteHour(id: string) {
    if (!window.confirm("¿Borrar este registro de horas? Esta acción resta las horas del proyecto.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteHourAction(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const columns: Column<RegistroHoras>[] = [
    {
      key: "fecha",
      header: "Fecha",
      sortable: true,
      render: (r) => formatDateShort(r.fecha),
      className: "font-mono text-xs",
    },
    {
      key: "cliente_id",
      header: "Cliente",
      sortable: true,
      render: (r) => clientesMap[r.cliente_id ?? ""]?.nombre ?? "—",
      className: "font-medium",
    },
    {
      key: "proyecto_id",
      header: "Proyecto",
      sortable: true,
      render: (r) => proyectosMap[r.proyecto_id]?.nombre ?? "—",
      className: "font-medium",
    },
    {
      key: "tarea_id",
      header: "Tarea",
      render: (r) => tareasMap[r.tarea_id]?.nombre ?? "—",
    },
    {
      key: "descripcion",
      header: "Descripción",
      className: "max-w-[200px] truncate text-muted-foreground",
    },
    {
      key: "horas",
      header: "Horas",
      sortable: true,
      align: "right",
      render: (r) => `${r.horas_trabajadas ?? r.horas}h`,
      className: "font-mono",
    },
    {
      key: "horas_a_cobrar",
      header: "A cobrar",
      sortable: true,
      align: "right",
      render: (r) => `${r.horas_a_cobrar ?? r.horas}h`,
      className: "font-mono",
    },
    {
      key: "monto_total",
      header: "Total",
      sortable: true,
      align: "right",
      render: (r) => <span className="font-semibold text-primary">{formatCurrency(r.monto_total)}</span>,
      className: "font-mono",
    },
    {
      key: "estado",
      header: "Estado",
      render: (r) => (
        <Badge variant={ESTADO_VARIANT[r.estado] ?? "secondary"} className="capitalize">
          {r.estado}
        </Badge>
      ),
    },
  ];

  if (repricedRecords.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">No hay registros aún.</p>
        <Button variant="link" asChild className="mt-2">
          <Link href="/horas/nuevo">Cargá tu primer registro →</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Horas trabajadas</p>
                <p className="text-2xl font-serif font-semibold text-foreground">{formatHours(summary.totalWorkedHours)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                <TrendingUp size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">A cobrar</p>
                <p className="text-2xl font-serif font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalAmount)}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{totalArs !== null ? formatCurrency(totalArs, "ARS") : "ARS —"}</p>
              </div>
            </div>
            <div className="rounded-2xl border bg-emerald-500/5 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">BNA hoy · venta</p>
                  <p className="font-mono font-semibold text-foreground">
                    {bnaLoading ? "Consultando…" : bnaRate ? `${formatCurrency(bnaRate.venta, "ARS")} / USD` : "No disponible"}
                  </p>
                  {bnaRate?.fecha ? <p className="text-[11px] text-muted-foreground">Fecha BNA: {formatDateShort(bnaRate.fecha)}</p> : null}
                  {bnaError ? <p className="text-[11px] text-destructive">{bnaError}</p> : null}
                </div>
                <Button type="button" size="sm" variant="outline" onClick={useBnaRate} disabled={!bnaRate} className="shrink-0">
                  Usar
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border bg-background/60 p-3">
              <Label htmlFor="dolar-rate-ars" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cotización manual ($)</Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="dolar-rate-ars"
                  inputMode="decimal"
                  value={dolarRateInput}
                  onChange={(event) => handleDolarRateChange(event.target.value)}
                  placeholder="Ej: 1200"
                  className="h-9 font-mono"
                  aria-label="Cotización del dólar en pesos argentinos"
                />
                <span className="text-xs font-semibold text-muted-foreground">ARS/USD</span>
              </div>
              {dolarRateInput && dolarRate === null ? <p className="mt-2 text-xs text-destructive">Cotización inválida</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Horas facturables</p>
                <p className="text-2xl font-serif font-semibold text-foreground">{formatHours(summary.totalBillableHours)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">Listado detallado · {monthLabel} · {clientLabel} · {filtrados.length} registros</h2>
          <p className="text-sm text-muted-foreground">Tarjetas, resumen, estados y tabla cambian con mes + cliente.</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {(["latest", "previous", "all"] as const).map((filter) => (
              <Button
                key={filter}
                variant={monthFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setMonthFilter(filter)}
                className="rounded-full"
              >
                {filter === "latest" ? "Último mes" : filter === "previous" ? "Mes anterior" : "Todos"}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-xs">
              <Select value={clientFilter} onValueChange={(value) => setClientFilter(value as ClientFilter)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientOptions.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>{cliente.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              {clientFilter === "all" ? "Filtro por cliente apagado." : `Mostrando solo horas de ${clientLabel}.`}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm shadow-sm">
          <div>
            <p className="font-semibold text-foreground">Resumen {monthLabel} · {clientLabel}</p>
            <p className="text-muted-foreground">
              Trabajadas {summary.totalWorkedHours}h · Facturables {summary.totalBillableHours}h · {formatCurrency(summary.totalAmount)}
            </p>
            {clientFilter !== "all" && selectedMonth ? (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Facturación mensual desactivada con filtro cliente. Quitá filtro para facturar mes completo.</p>
            ) : null}
          </div>
          <Button disabled={!canInvoiceMonth} onClick={() => setConfirmOpen(true)}>
            Marcar mes facturado
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filtroEstado === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFiltroEstado(null)}
          className="rounded-full"
        >
          Todos ({baseFiltered.length})
        </Button>
        {ESTADOS.map((estado) => {
          const count = baseFiltered.filter((r) => r.estado === estado).length;
          if (count === 0) return null;
          return (
            <Button
              key={estado}
              variant={filtroEstado === estado ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroEstado(filtroEstado === estado ? null : estado)}
              className="rounded-full capitalize"
            >
              {estado} ({count})
            </Button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filtrados}
        emptyMessage="No hay registros para filtros actuales"
        onRowClick={(r) => router.push(`/horas/${r.id}`)}
        actions={(r) => (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/horas/${r.id}`)} title="Ver detalle">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push(`/horas/${r.id}/editar`)} title="Editar">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(event) => {
                event.stopPropagation();
                handleDeleteHour(r.id);
              }}
              title="Borrar"
              disabled={isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar facturación mensual</DialogTitle>
            <DialogDescription>
              Se marcarán como facturados {invoiceSummary?.eligibleCount ?? 0} registros de {selectedMonth}. Total: {formatCurrency(invoiceSummary?.eligibleAmount ?? 0)}. No se modifican rechazados ni ya facturados.
            </DialogDescription>
          </DialogHeader>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={isPending}>Cancelar</Button></DialogClose>
            <Button onClick={handleMarkMonth} disabled={isPending || !canInvoiceMonth}>{isPending ? "Facturando…" : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
