"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, DollarSign, Clock, X } from "lucide-react";
import { hourFormSchema, type HourFormData } from "@/lib/schemas/hour";
import { previewMonto } from "@/lib/pricing/calculateHoursAmount";
import { createHour } from "@/app/actions/hours";
import { createProyectoAction } from "@/app/actions/projects";
import { createTareaAction } from "@/app/actions/tasks";
import { createClienteAction } from "@/app/actions/clients";
import { formatCurrency } from "@/lib/utils/index";
import type { Tarea, Proyecto, Cliente, AppConfig } from "@/types/entities";

const NEW_PROYECTO = "__new_proyecto__";
const NEW_TAREA    = "__new_tarea__";
const NEW_CLIENTE  = "__new_cliente__";

interface Props {
  clientes:             Cliente[];
  tareas:               Tarea[];
  proyectos:            Proyecto[];
  defaultConfig:        AppConfig;
  /** Total horas del usuario en el mes actual (todos los proyectos) */
  horasAcumuladasMes:   number;
}

export default function HorasForm({ clientes: initClientes, tareas: initTareas, proyectos: initProyectos, defaultConfig, horasAcumuladasMes }: Props) {
  const router = useRouter();
  const [status, setStatus]     = useState<"idle"|"loading"|"success"|"error">("idle");
  const [serverError, setServerError] = useState<string|null>(null);
  const [previewAmount, setPreviewAmount] = useState(0);
  const [clientes, setClientes]   = useState(initClientes);
  const [proyectos, setProyectos] = useState(initProyectos);
  const [tareas, setTareas]       = useState(initTareas);

  // Inline modal states
  const [modalCliente, setModalCliente]   = useState(false);
  const [modalProyecto, setModalProyecto] = useState(false);
  const [modalTarea, setModalTarea]       = useState(false);
  const [newNombreC, setNewNombreC]       = useState("");
  const [newEmailC, setNewEmailC]         = useState("");
  const [newNombreP, setNewNombreP]       = useState("");
  const [newNombreT, setNewNombreT]       = useState("");
  const [savingC, setSavingC]             = useState(false);
  const [savingP, setSavingP]             = useState(false);
  const [savingT, setSavingT]             = useState(false);
  const [errC, setErrC]                   = useState("");
  const [errP, setErrP]                   = useState("");
  const [errT, setErrT]                   = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HourFormData>({
    resolver: zodResolver(hourFormSchema),
    mode: "onTouched",
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      horas: 1, estado: "confirmado",
      cliente_id: "", proyecto_id: "", tarea_id: "",
    },
  });

  const watchedClienteId  = watch("cliente_id");
  const watchedProyectoId = watch("proyecto_id");
  const watchedTareaId    = watch("tarea_id");
  const watchedHoras      = watch("horas");

  // Filtramos proyectos según cliente seleccionado
  const proyectosFiltrados = watchedClienteId
    ? proyectos.filter(p => p.cliente_id === watchedClienteId)
    : proyectos;

  // Intercept "Crear nuevo" selection
  useEffect(() => {
    if (watchedClienteId === NEW_CLIENTE) {
      setValue("cliente_id", "");
      setModalCliente(true);
    }
  }, [watchedClienteId, setValue]);

  useEffect(() => {
    if (watchedProyectoId === NEW_PROYECTO) {
      setValue("proyecto_id", "");
      setModalProyecto(true);
    }
  }, [watchedProyectoId, setValue]);

  useEffect(() => {
    if (watchedTareaId === NEW_TAREA) {
      setValue("tarea_id", "");
      setModalTarea(true);
    }
  }, [watchedTareaId, setValue]);

  // Price preview — usa acumulado mensual global (reset cada mes, todos los proyectos)
  useEffect(() => {
    if (!watchedProyectoId || !watchedHoras) { setPreviewAmount(0); return; }
    const p = proyectos.find((p) => p.id === watchedProyectoId);
    if (!p) return;
    setPreviewAmount(previewMonto(Number(watchedHoras), horasAcumuladasMes, {
      precioBase:  p.precio_base        || defaultConfig.precioBase,
      precioAlto:  p.precio_alto        || defaultConfig.precioAlto,
      umbralHoras: p.umbral_precio_alto || defaultConfig.umbralHoras,
    }));
  }, [watchedProyectoId, watchedHoras, proyectos, defaultConfig, horasAcumuladasMes]);

  async function handleCreateCliente() {
    if (!newNombreC.trim() || !newEmailC.trim()) return;
    setSavingC(true); setErrC("");
    const res = await createClienteAction({
      nombre: newNombreC, email: newEmailC, activo: true,
    });
    setSavingC(false);
    if (!res.success) { setErrC(res.error); return; }
    setClientes((prev) => [...prev, res.data]);
    setValue("cliente_id", res.data.id);
    setNewNombreC(""); setNewEmailC("");
    setModalCliente(false);
  }

  async function handleCreateProyecto() {
    if (!newNombreP.trim() || !watchedClienteId) {
      setErrP("Por favor seleccioná un cliente primero.");
      return;
    }
    setSavingP(true); setErrP("");
    const res = await createProyectoAction({
      nombre: newNombreP, estado: "activo",
      cliente_id: watchedClienteId,
      precio_base: defaultConfig.precioBase,
      precio_alto: defaultConfig.precioAlto,
      umbral_precio_alto: defaultConfig.umbralHoras,
    });
    setSavingP(false);
    if (!res.success) { setErrP(res.error); return; }
    setProyectos((prev) => [...prev, res.data]);
    setValue("proyecto_id", res.data.id);
    setNewNombreP("");
    setModalProyecto(false);
  }

  async function handleCreateTarea() {
    if (!newNombreT.trim()) return;
    setSavingT(true); setErrT("");
    const res = await createTareaAction({ nombre: newNombreT, activa: true });
    setSavingT(false);
    if (!res.success) { setErrT(res.error); return; }
    setTareas((prev) => [...prev, res.data]);
    setValue("tarea_id", res.data.id);
    setNewNombreT("");
    setModalTarea(false);
  }

  async function onSubmit(data: HourFormData) {
    setStatus("loading"); setServerError(null);
    const result = await createHour(data);
    if (!result.success) { setStatus("error"); setServerError(result.error); return; }
    setStatus("success");
    setTimeout(() => router.push("/horas"), 1200);
  }

  const fc = (err: boolean) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm text-ink bg-white focus:outline-none focus:ring-2 transition-all
    ${err ? "border-red-400 focus:ring-red-400/30" : "border-slate-200 focus:ring-brand-600/30 focus:border-brand-600"}`;

  const selectedP = proyectos.find((p) => p.id === watchedProyectoId);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col gap-6" noValidate>

        {/* Cliente */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Cliente</label>
          <select {...register("cliente_id")} className={fc(!!errors.cliente_id)}>
            <option value="">— Seleccioná un cliente —</option>
            <option value={NEW_CLIENTE}>✚ Crear nuevo cliente…</option>
            {clientes.length > 0 && <option disabled>──────────────</option>}
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.cliente_id && <Err msg={errors.cliente_id.message} />}
        </div>

        {/* Proyecto */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Proyecto</label>
          <select {...register("proyecto_id")} className={fc(!!errors.proyecto_id)} disabled={!watchedClienteId}>
            <option value="">— Seleccioná un proyecto —</option>
            {watchedClienteId && <option value={NEW_PROYECTO}>✚ Crear nuevo proyecto…</option>}
            {proyectosFiltrados.length > 0 && <option disabled>──────────────</option>}
            {proyectosFiltrados.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {p.horas_acumuladas}h acum.
              </option>
            ))}
          </select>
          {errors.proyecto_id && <Err msg={errors.proyecto_id.message} />}
          {!watchedClienteId && <p className="text-xs text-slate-400">Seleccioná un cliente primero para ver sus proyectos.</p>}
        </div>

        {/* Tarea */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Tarea</label>
          <select {...register("tarea_id")} className={fc(!!errors.tarea_id)}>
            <option value="">— Seleccioná una tarea —</option>
            <option value={NEW_TAREA}>✚ Crear nueva tarea…</option>
            {tareas.length > 0 && <option disabled>──────────────</option>}
            {tareas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}{t.categoria ? ` · ${t.categoria}` : ""}
              </option>
            ))}
          </select>
          {errors.tarea_id && <Err msg={errors.tarea_id.message} />}
        </div>

        {/* Fecha + Horas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">Fecha</label>
            <input type="date" {...register("fecha")} className={fc(!!errors.fecha)} />
            {errors.fecha && <Err msg={errors.fecha.message} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <label className="text-sm font-medium text-ink">Horas</label>
              <span className="text-xs text-slate-400">Mín. 0.25 (15 min)</span>
            </div>
            <input type="number" step="0.25" min="0.25" max="24"
              {...register("horas", { valueAsNumber: true })}
              className={fc(!!errors.horas)} placeholder="1.5" />
            {errors.horas && <Err msg={errors.horas.message} />}
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Descripción del trabajo</label>
          <textarea {...register("descripcion")} rows={3}
            placeholder="Describe brevemente el trabajo realizado…"
            className={`${fc(!!errors.descripcion)} resize-none`} />
          {errors.descripcion && <Err msg={errors.descripcion.message} />}
        </div>

        {/* Price preview */}
        <AnimatePresence>
          {watchedProyectoId && watchedHoras > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-600">
                  <DollarSign size={15} />
                  <span className="text-sm font-medium">Monto estimado</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold font-mono text-brand-700">
                    {formatCurrency(previewAmount, defaultConfig.moneda)}
                  </span>
                  {selectedP && (
                    <p className="text-xs text-brand-500 mt-0.5 flex items-center gap-1 justify-end">
                      <Clock size={10} /> {selectedP.horas_acumuladas}h acum. · umbral {selectedP.umbral_precio_alto || defaultConfig.umbralHoras}h
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {serverError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={15} className="shrink-0" /> {serverError}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <motion.button type="submit" disabled={status === "loading" || status === "success"} whileTap={{ scale: 0.98 }}
            className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold rounded-lg py-3 text-sm flex items-center justify-center gap-2 transition-colors">
            {status === "loading" && <Loader2 size={15} className="animate-spin" />}
            {status === "success" && <CheckCircle size={15} />}
            {status === "idle" ? "Guardar registro" : status === "loading" ? "Guardando…" : status === "success" ? "¡Guardado!" : "Guardar registro"}
          </motion.button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-3 rounded-lg border border-slate-200 text-ink text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal: Nuevo Cliente */}
      <AnimatePresence>
        {modalCliente && (
          <Modal title="Nuevo cliente" onClose={() => setModalCliente(false)}>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Nombre *</label>
                <input autoFocus value={newNombreC} onChange={(e) => setNewNombreC(e.target.value)}
                  placeholder="Ej: Acumen Corp"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Email de facturación *</label>
                <input value={newEmailC} onChange={(e) => setNewEmailC(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateCliente()}
                  placeholder="admin@ejemplo.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 mt-1" />
              </div>
            </div>
            {errC && <p className="text-red-500 text-sm mt-2">{errC}</p>}
            <button onClick={handleCreateCliente} disabled={savingC || !newNombreC.trim() || !newEmailC.trim()}
              className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
              {savingC ? <Loader2 size={14} className="animate-spin" /> : null}
              {savingC ? "Creando…" : "Crear y seleccionar"}
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal: Nuevo Proyecto */}
      <AnimatePresence>
        {modalProyecto && (
          <Modal title="Nuevo proyecto" onClose={() => setModalProyecto(false)}>
            <label className="text-xs font-medium text-slate-600">Nombre del proyecto *</label>
            <input autoFocus value={newNombreP} onChange={(e) => setNewNombreP(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProyecto()}
              placeholder="Ej: Rediseño web 2026"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600" />
            <p className="text-xs text-slate-400">Se creará con precios globales (${defaultConfig.precioBase}/${ defaultConfig.precioAlto}, umbral {defaultConfig.umbralHoras}h). Podés editarlo luego en Admin → Proyectos.</p>
            {errP && <p className="text-red-500 text-sm">{errP}</p>}
            <button onClick={handleCreateProyecto} disabled={savingP || !newNombreP.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
              {savingP ? <Loader2 size={14} className="animate-spin" /> : null}
              {savingP ? "Creando…" : "Crear y seleccionar"}
            </button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Modal: Nueva Tarea */}
      <AnimatePresence>
        {modalTarea && (
          <Modal title="Nueva tarea" onClose={() => setModalTarea(false)}>
            <label className="text-xs font-medium text-slate-600">Nombre *</label>
            <input autoFocus value={newNombreT} onChange={(e) => setNewNombreT(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateTarea()}
              placeholder="Ej: Desarrollo Backend"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600" />
            {errT && <p className="text-red-500 text-sm">{errT}</p>}
            <button onClick={handleCreateTarea} disabled={savingT || !newNombreT.trim()}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 transition-colors">
              {savingT ? <Loader2 size={14} className="animate-spin" /> : null}
              {savingT ? "Creando…" : "Crear y seleccionar"}
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-ink">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Err({ msg }: { msg?: string }) {
  return <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {msg}</p>;
}
