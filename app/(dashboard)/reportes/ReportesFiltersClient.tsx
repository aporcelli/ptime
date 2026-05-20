"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, FileDown, CalendarDays, X } from "lucide-react";
import dynamic from "next/dynamic";
import type { Cliente, Proyecto } from "@/types/entities";
import type { ReportData } from "@/types/api";

const ReporteTemplate = dynamic(() => import("@/components/pdf/ReporteTemplate"), { ssr: false });

interface Props {
  clientes: Cliente[];
  proyectos: Proyecto[];
  data: ReportData;
  registros: Array<{
    fecha: string; descripcion: string; clienteNombre?: string; proyectoNombre: string;
    horas: number; horasFacturadas?: number; precioHora: number; total: number; estado: string;
  }>;
  fechaDesde: string;
  fechaHasta: string;
  moneda: string;
  nombreEmpresa: string;
}

export function ReportesFiltersClient({
  clientes, proyectos, data, registros,
  fechaDesde: initDesde, fechaHasta: initHasta,
  moneda, nombreEmpresa,
}: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filtros
  const [desde,      setDesde]      = useState(initDesde);
  const [hasta,      setHasta]      = useState(initHasta);
  const [clienteIdFiltro, setClienteIdFiltro] = useState(searchParams.get("clienteId") ?? "");
  const [proyectoId, setProyectoId] = useState(searchParams.get("proyectoId") ?? "");
  const [estado,     setEstado]     = useState(searchParams.get("estado") ?? "");

  // Selector mensual simplificado
  const currentMonthValue = desde && hasta && desde.slice(0,7) === hasta.slice(0,7) && desde.endsWith("-01")
    ? desde.slice(0,7) : "";
  const [mesSeleccionado, setMesSeleccionado] = useState(currentMonthValue);

  // Panel PDF
  const [pdfOpen,    setPdfOpen]    = useState(false);
  const [titulo,     setTitulo]     = useState("Reporte de Horas Mensuales");
  const [clienteId,  setClienteId]  = useState("");
  const [incluirDet, setIncluirDet] = useState(true);

  const clienteSeleccionado = clientes.find(c => c.id === clienteId);

  const clientesOrdenados = useMemo(
    () => [...clientes].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })),
    [clientes],
  );

  const proyectosOrdenados = useMemo(() => {
    const base = clienteIdFiltro
      ? proyectos.filter((p) => p.cliente_id === clienteIdFiltro)
      : proyectos;

    return [...base].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
  }, [proyectos, clienteIdFiltro]);

  const estadoLabel = (value: string) => {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const activeFilters = [
    desde && { key: "desde", label: `Desde: ${desde}` },
    hasta && { key: "hasta", label: `Hasta: ${hasta}` },
    mesSeleccionado && { key: "mes", label: `Mes: ${mesSeleccionado}` },
    clienteIdFiltro && { key: "cliente", label: `Cliente: ${clientes.find(c => c.id === clienteIdFiltro)?.nombre ?? "—"}` },
    proyectoId && { key: "proyecto", label: `Proyecto: ${proyectos.find(p => p.id === proyectoId)?.nombre ?? "—"}` },
    estado && { key: "estado", label: `Estado: ${estadoLabel(estado)}` },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  function clearSingleFilter(key: string) {
    if (key === "desde") return handleDesdeChange("");
    if (key === "hasta") return handleHastaChange("");
    if (key === "mes") return handleInputMesChange("");
    if (key === "cliente") {
      setProyectoId("");
      return handleClienteFiltroChange("");
    }
    if (key === "proyecto") return handleProyectoChange("");
    if (key === "estado") return handleEstadoChange("");
  }

  // Helper para armar query params
  function pushParams(newDesde: string, newHasta: string, newCliente: string, newProy: string, newEst: string) {
    const params = new URLSearchParams();
    if (newDesde) params.set("fechaDesde", newDesde);
    if (newHasta) params.set("fechaHasta", newHasta);
    if (newCliente) params.set("clienteId", newCliente);
    if (newProy)  params.set("proyectoId", newProy);
    if (newEst)   params.set("estado",     newEst);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleDesdeChange(val: string) {
    setDesde(val);
    setMesSeleccionado("");
    pushParams(val, hasta, clienteIdFiltro, proyectoId, estado);
  }

  function handleHastaChange(val: string) {
    setHasta(val);
    setMesSeleccionado("");
    pushParams(desde, val, clienteIdFiltro, proyectoId, estado);
  }

  function handleClienteFiltroChange(val: string) {
    setClienteIdFiltro(val);

    const proyectoSigueSiendoValido = !proyectoId
      ? ""
      : proyectos.some((p) => p.id === proyectoId && (!val || p.cliente_id === val));

    const nextProyecto = proyectoSigueSiendoValido ? proyectoId : "";
    if (!proyectoSigueSiendoValido) setProyectoId("");

    pushParams(desde, hasta, val, nextProyecto, estado);
  }

  function handleProyectoChange(val: string) {
    setProyectoId(val);
    pushParams(desde, hasta, clienteIdFiltro, val, estado);
  }

  function handleEstadoChange(val: string) {
    setEstado(val);
    pushParams(desde, hasta, clienteIdFiltro, proyectoId, val);
  }

  function limpiar() {
    setDesde(""); setHasta("");
    setClienteIdFiltro(""); setProyectoId(""); setEstado("");
    setMesSeleccionado("");
    startTransition(() => router.push(pathname));
  }

  // Setters rápidos
  function getMonthRange(año: number, mes: number) {
    const dDesde = new Date(año, mes - 1, 1);
    const dHasta = new Date(año, mes, 0);
    return {
      strDesde: dDesde.toISOString().split("T")[0],
      strHasta: dHasta.toISOString().split("T")[0],
      valMes: `${año}-${String(mes).padStart(2, "0")}`,
    };
  }

  function setRangoMes(año: number, mes: number) {
    const { strDesde, strHasta, valMes } = getMonthRange(año, mes);

    setDesde(strDesde);
    setHasta(strHasta);
    setMesSeleccionado(valMes);
    pushParams(strDesde, strHasta, clienteIdFiltro, proyectoId, estado);
  }

  const now = new Date();
  const thisMonth = getMonthRange(now.getFullYear(), now.getMonth() + 1);
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = getMonthRange(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1);

  const isQuickEsteMes = desde === thisMonth.strDesde && hasta === thisMonth.strHasta;
  const isQuickMesPasado = desde === prevMonth.strDesde && hasta === prevMonth.strHasta;

  function handleQuickEsteMes() {
    setRangoMes(now.getFullYear(), now.getMonth() + 1);
  }

  function handleQuickMesPasado() {
    setRangoMes(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1);
  }

  function handleInputMesChange(val: string) {
    setMesSeleccionado(val);
    if (!val) {
      setDesde(""); setHasta("");
      pushParams("", "", clienteIdFiltro, proyectoId, estado);
      return;
    }
    const [yStr, mStr] = val.split("-");
    setRangoMes(parseInt(yStr), parseInt(mStr));
  }

  const tituloFinal = titulo;
  const pdfPanelId = "reporte-pdf-panel";

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros rápidos */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-sm font-medium text-on-surface-variant flex items-center gap-1">
          <CalendarDays size={16}/> Filtros rápidos:
        </span>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleQuickEsteMes}
          aria-pressed={isQuickEsteMes}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40 ${isQuickEsteMes ? "bg-primary-fixed text-white border-primary-fixed" : "bg-surface-low hover:bg-surface-high text-on-surface border-outline-variant"}`}
        >
          Este mes
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={handleQuickMesPasado}
          aria-pressed={isQuickMesPasado}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40 ${isQuickMesPasado ? "bg-primary-fixed text-white border-primary-fixed" : "bg-surface-low hover:bg-surface-high text-on-surface border-outline-variant"}`}
        >
          Mes pasado
        </motion.button>
      </div>

      {/* Barra de filtros */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        aria-busy={isPending}
        className={`bg-surface-lowest rounded-xl p-4 shadow-ambient transition-opacity ${isPending ? "opacity-60" : ""}`}
      >
        <p className="sr-only" aria-live="polite">
          {isPending ? "Actualizando reportes con filtros" : "Filtros listos"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="reportes-mes" className="text-xs font-medium text-on-surface-variant">Mes específico</label>
            <input
              id="reportes-mes"
              type="month"
              value={mesSeleccionado}
              onChange={e => handleInputMesChange(e.target.value)}
              className="meridian-input text-sm h-9 px-2 rounded-lg bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="reportes-desde" className="text-xs font-medium text-on-surface-variant">Desde</label>
              <input
                id="reportes-desde"
                type="date"
                value={desde}
                onChange={e => handleDesdeChange(e.target.value)}
                className="meridian-input text-sm h-9 px-2 rounded-lg bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="reportes-hasta" className="text-xs font-medium text-on-surface-variant">Hasta</label>
              <input
                id="reportes-hasta"
                type="date"
                value={hasta}
                onChange={e => handleHastaChange(e.target.value)}
                className="meridian-input text-sm h-9 px-2 rounded-lg bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="reportes-cliente" className="text-xs font-medium text-on-surface-variant">Cliente</label>
              <select
                id="reportes-cliente"
                value={clienteIdFiltro}
                onChange={e => handleClienteFiltroChange(e.target.value)}
                className="h-9 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
              >
                <option value="">Todos</option>
                {clientesOrdenados.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reportes-proyecto" className="text-xs font-medium text-on-surface-variant">Proyecto</label>
              <select
                id="reportes-proyecto"
                value={proyectoId}
                onChange={e => handleProyectoChange(e.target.value)}
                className="h-9 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
              >
                <option value="">Todos</option>
                {proyectosOrdenados.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="reportes-estado" className="text-xs font-medium text-on-surface-variant">Estado</label>
              <select
                id="reportes-estado"
                value={estado}
                onChange={e => handleEstadoChange(e.target.value)}
                className="h-9 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30"
              >
                <option value="">Todos</option>
                <option value="borrador">Borrador</option>
                <option value="confirmado">Confirmado</option>
                <option value="facturado">Facturado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {activeFilters.length === 0 ? (
              <span className="text-xs text-on-surface-variant">Sin filtros activos</span>
            ) : activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => clearSingleFilter(filter.key)}
                aria-label={`Quitar ${filter.label}`}
                className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-low px-2.5 py-1 text-xs text-on-surface hover:bg-surface-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40"
                title="Quitar filtro"
              >
                {filter.label}
                <X size={12} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={limpiar}
            className="h-9 px-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-high text-sm rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40"
          >
            Limpiar filtros
          </button>
        </div>
      </motion.div>

      {/* Panel PDF personalizable */}
      <div className="bg-surface-lowest rounded-xl shadow-ambient overflow-hidden">
        <button
          type="button"
          onClick={() => setPdfOpen(v => !v)}
          aria-expanded={pdfOpen}
          aria-controls={pdfPanelId}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-low transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed/40"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <FileDown size={15} className="text-primary-fixed" />
            Exportar PDF
          </span>
          {pdfOpen ? <ChevronUp size={15} className="text-on-surface-variant" /> : <ChevronDown size={15} className="text-on-surface-variant" />}
        </button>

        <AnimatePresence initial={false}>
          {pdfOpen && (
            <motion.div
              id={pdfPanelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-surface-high">
                <div className="flex flex-col gap-1 pt-3">
                  <label htmlFor="reporte-titulo" className="text-xs font-medium text-on-surface-variant">Título del reporte</label>
                  <input
                    id="reporte-titulo"
                    type="text"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    placeholder="Ej: Reporte de Horas Mensuales"
                    className="h-8 px-3 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30 focus:bg-surface-lowest transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="reporte-cliente-pdf" className="text-xs font-medium text-on-surface-variant">Cliente (opcional)</label>
                  <select id="reporte-cliente-pdf" value={clienteId} onChange={e => setClienteId(e.target.value)}
                    className="h-8 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30">
                    <option value="">Sin cliente específico</option>
                    {clientesOrdenados.filter(c => c.activo).map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <label htmlFor="reporte-incluir-detalle" className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                  <input id="reporte-incluir-detalle" type="checkbox" checked={incluirDet} onChange={e => setIncluirDet(e.target.checked)}
                    className="rounded accent-primary-fixed" />
                  Incluir detalle de registros
                </label>

                {/* Preview del título */}
                {(titulo || clienteSeleccionado) && (
                  <div className="bg-surface-low rounded-lg px-3 py-2 text-xs text-on-surface-variant">
                    <span className="font-medium text-on-surface">{titulo}</span>
                    {clienteSeleccionado && <span className="ml-1">· Cliente: {clienteSeleccionado.nombre}</span>}
                  </div>
                )}

                <ReporteTemplate
                  data={data}
                  registros={incluirDet ? registros : []}
                  fechaDesde={desde}
                  fechaHasta={hasta}
                  moneda={moneda}
                  nombreEmpresa={nombreEmpresa}
                  tituloReporte={tituloFinal}
                  clienteNombre={clienteSeleccionado?.nombre}
                  label="Descargar PDF"
                  className="self-start"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}