"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, ChevronDown, ChevronUp, FileDown, CalendarDays } from "lucide-react";
import dynamic from "next/dynamic";
import type { Cliente, Proyecto, HoraEstado } from "@/types/entities";
import type { ReportData } from "@/types/api";

const ReporteTemplate = dynamic(() => import("@/components/pdf/ReporteTemplate"), { ssr: false });

interface Props {
  clientes: Cliente[];
  proyectos: Proyecto[];
  data: ReportData;
  registros: Array<{
    fecha: string; descripcion: string; proyectoNombre: string;
    horas: number; precioHora: number; total: number; estado: string;
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

  // Helper para armar query params
  function pushParams(newDesde: string, newHasta: string, newProy: string, newEst: string) {
    const params = new URLSearchParams();
    if (newDesde) params.set("fechaDesde", newDesde);
    if (newHasta) params.set("fechaHasta", newHasta);
    if (newProy)  params.set("proyectoId", newProy);
    if (newEst)   params.set("estado",     newEst);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleDesdeChange(val: string) {
    setDesde(val);
    setMesSeleccionado("");
    pushParams(val, hasta, proyectoId, estado);
  }

  function handleHastaChange(val: string) {
    setHasta(val);
    setMesSeleccionado("");
    pushParams(desde, val, proyectoId, estado);
  }

  function handleProyectoChange(val: string) {
    setProyectoId(val);
    pushParams(desde, hasta, val, estado);
  }

  function handleEstadoChange(val: string) {
    setEstado(val);
    pushParams(desde, hasta, proyectoId, val);
  }

  function limpiar() {
    setDesde(""); setHasta("");
    setProyectoId(""); setEstado("");
    setMesSeleccionado("");
    startTransition(() => router.push(pathname));
  }

  // Setters rápidos
  function setRangoMes(año: number, mes: number) {
    // mes es 1-12
    const dDesde = new Date(año, mes - 1, 1);
    const dHasta = new Date(año, mes, 0); // último día del mes
    const strDesde = dDesde.toISOString().split("T")[0];
    const strHasta = dHasta.toISOString().split("T")[0];
    const valMes = `${año}-${String(mes).padStart(2, "0")}`;
    
    setDesde(strDesde);
    setHasta(strHasta);
    setMesSeleccionado(valMes);
    pushParams(strDesde, strHasta, proyectoId, estado);
  }

  function handleQuickEsteMes() {
    const hoy = new Date();
    setRangoMes(hoy.getFullYear(), hoy.getMonth() + 1);
  }

  function handleQuickMesPasado() {
    const hoy = new Date();
    let y = hoy.getFullYear();
    let m = hoy.getMonth(); // 0-11
    if (m === 0) { m = 12; y -= 1; }
    setRangoMes(y, m);
  }

  function handleInputMesChange(val: string) {
    setMesSeleccionado(val);
    if (!val) {
      setDesde(""); setHasta("");
      pushParams("", "", proyectoId, estado);
      return;
    }
    const [yStr, mStr] = val.split("-");
    setRangoMes(parseInt(yStr), parseInt(mStr));
  }

  const tituloFinal = titulo
    + (clienteSeleccionado ? ` - Cliente: ${clienteSeleccionado.nombre}` : "");

  return (
    <div className="flex flex-col gap-4">
      {/* Botonera Rápida */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-sm font-medium text-on-surface-variant flex items-center gap-1">
          <CalendarDays size={16}/> Filtros rápidos:
        </span>
        <button onClick={handleQuickEsteMes}
          className="text-xs px-3 py-1.5 bg-surface-low hover:bg-surface-high text-on-surface rounded-full border border-outline-variant transition-colors">
          Este mes
        </button>
        <button onClick={handleQuickMesPasado}
          className="text-xs px-3 py-1.5 bg-surface-low hover:bg-surface-high text-on-surface rounded-full border border-outline-variant transition-colors">
          Mes pasado
        </button>
      </div>

      {/* Barra de filtros */}
      <div className={`bg-surface-lowest rounded-xl p-4 shadow-ambient flex flex-wrap gap-4 items-end transition-opacity ${isPending ? "opacity-60" : ""}`}>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Mes específico</label>
          <input type="month" value={mesSeleccionado} onChange={e => handleInputMesChange(e.target.value)}
            className="meridian-input text-sm h-8 px-2 rounded-lg bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30" />
        </div>

        <div className="hidden sm:block w-px h-8 bg-outline-variant/50 self-center mx-1"></div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Rango (Desde)</label>
          <input type="date" value={desde} onChange={e => handleDesdeChange(e.target.value)}
            className="meridian-input text-sm h-8 px-2 rounded-lg bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Rango (Hasta)</label>
          <input type="date" value={hasta} onChange={e => handleHastaChange(e.target.value)}
            className="meridian-input text-sm h-8 px-2 rounded-lg bg-surface-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-fixed/30" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Proyecto</label>
          <select value={proyectoId} onChange={e => handleProyectoChange(e.target.value)}
            className="h-8 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30">
            <option value="">Todos</option>
            {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-on-surface-variant">Estado</label>
          <select value={estado} onChange={e => handleEstadoChange(e.target.value)}
            className="h-8 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30">
            <option value="">Todos</option>
            <option value="borrador">Borrador</option>
            <option value="confirmado">Confirmado</option>
            <option value="facturado">Facturado</option>
          </select>
        </div>

        <div className="flex gap-2 pb-0.5 ml-auto">
          <button onClick={limpiar}
            className="h-8 px-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-high text-sm rounded-lg transition-colors">
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Panel PDF personalizable */}
      <div className="bg-surface-lowest rounded-xl shadow-ambient overflow-hidden">
        <button
          onClick={() => setPdfOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-low transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <FileDown size={15} className="text-primary-fixed" />
            Exportar PDF
          </span>
          {pdfOpen ? <ChevronUp size={15} className="text-on-surface-variant" /> : <ChevronDown size={15} className="text-on-surface-variant" />}
        </button>

        {pdfOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3 border-t border-surface-high">
            <div className="flex flex-col gap-1 pt-3">
              <label className="text-xs font-medium text-on-surface-variant">Título del reporte</label>
              <input
                type="text"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ej: Reporte de Horas Mensuales"
                className="h-8 px-3 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30 focus:bg-surface-lowest transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-on-surface-variant">Cliente (opcional)</label>
              <select value={clienteId} onChange={e => setClienteId(e.target.value)}
                className="h-8 px-2 rounded-lg bg-surface-low text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-fixed/30">
                <option value="">Sin cliente específico</option>
                {clientes.filter(c => c.activo).map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
              <input type="checkbox" checked={incluirDet} onChange={e => setIncluirDet(e.target.checked)}
                className="rounded accent-primary-fixed" />
              Incluir detalle de registros
            </label>

            {/* Preview del título */}
            {(titulo || clienteSeleccionado) && (
              <div className="bg-surface-low rounded-lg px-3 py-2 text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">{titulo}</span>
                {clienteSeleccionado && <span className="ml-1">— Cliente: {clienteSeleccionado.nombre}</span>}
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
        )}
      </div>
    </div>
  );
}