"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, DollarSign, Clock, X, Plus } from "lucide-react";
import { hourFormSchema, type HourFormData } from "@/lib/schemas/hour";
import { previewMonto } from "@/lib/pricing/calculateHoursAmount";
import { createHour, updateHourAction } from "@/app/actions/hours";
import { createProyectoAction } from "@/app/actions/projects";
import { createTareaAction } from "@/app/actions/tasks";
import { createClienteAction } from "@/app/actions/clients";
import { formatCurrency } from "@/lib/utils/index";
import type { Tarea, Proyecto, Cliente, AppConfig } from "@/types/entities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";

interface Props {
  clientes:             Cliente[];
  tareas:               Tarea[];
  proyectos:            Proyecto[];
  defaultConfig:        AppConfig;
  /** Total horas del usuario en el mes actual (todos los proyectos) */
  horasAcumuladasMes:   number;
  initialData?:         HourFormData & { id: string };
}

export default function HorasForm({ clientes: initClientes, tareas: initTareas, proyectos: initProyectos, defaultConfig, horasAcumuladasMes, initialData }: Props) {
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

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<HourFormData>({
    resolver: zodResolver(hourFormSchema),
    mode: "onTouched",
    defaultValues: initialData ? {
      cliente_id: initialData.cliente_id,
      proyecto_id: initialData.proyecto_id,
      tarea_id: initialData.tarea_id,
      fecha: initialData.fecha,
      horas: initialData.horas,
      descripcion: initialData.descripcion,
      estado: initialData.estado,
    } : {
      fecha: new Date().toISOString().split("T")[0],
      horas: 1, estado: "confirmado",
      cliente_id: "", proyecto_id: "", tarea_id: "",
    },
  });

  const watchedClienteId  = watch("cliente_id");
  const watchedProyectoId = watch("proyecto_id");
  const watchedTareaId    = watch("tarea_id");
  const watchedHoras      = watch("horas");

  // Si el proyecto no tiene cliente_id asignado en el Sheet, lo mostramos igual
  // (cliente_id vacío = proyecto "global" accesible desde cualquier cliente)
  const proyectosFiltrados = proyectos.filter(p => {
    const pid = p.cliente_id.trim();
    return !watchedClienteId || pid === "" || pid.toLowerCase() === watchedClienteId.trim().toLowerCase();
  });

  // Resetear proyecto_id si cambia de cliente y el proyecto no le pertenece
  useEffect(() => {
    if (watchedClienteId && watchedProyectoId) {
      const isValid = proyectosFiltrados.some(p => p.id === watchedProyectoId);
      if (!isValid) {
        setValue("proyecto_id", "", { shouldValidate: true });
      }
    }
  }, [watchedClienteId, proyectosFiltrados, watchedProyectoId, setValue]);

  // Price preview
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
    try {
      const result = initialData
        ? await updateHourAction(initialData.id, data)
        : await createHour(data);

      if (!result.success) {
        setStatus("error");
        setServerError(result.error ?? "Ocurrió un error inesperado al guardar.");
        return;
      }
      setStatus("success");
      setTimeout(() => router.push("/horas"), 1200);
    } catch (err: any) {
      setStatus("error");
      setServerError(err?.message || "Error grave de conexión al guardar.");
    }
  }

  const selectedP = proyectos.find((p) => p.id === watchedProyectoId);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-card text-card-foreground rounded-2xl border border-border p-6 md:p-8 flex flex-col gap-6" noValidate>



        {/* Cliente */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cliente_id">Cliente</Label>
          <Controller
            name="cliente_id"
            control={control}
            render={({ field }) => (
              <Combobox
                options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Seleccionar cliente..."
                onCreateNew={() => setModalCliente(true)}
                createNewText="Crear nuevo cliente..."
                className={errors.cliente_id ? "border-red-400" : ""}
              />
            )}
          />
          {errors.cliente_id && <Err msg={errors.cliente_id.message} />}
        </div>

        {/* Proyecto */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="proyecto_id">Proyecto</Label>
          <Controller
            name="proyecto_id"
            control={control}
            render={({ field }) => (
              <Combobox
                options={proyectosFiltrados.map(p => ({ value: p.id, label: `${p.nombre} (${p.horas_acumuladas}h)` }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={watchedClienteId ? "Seleccionar proyecto..." : "Seleccioná un cliente primero"}
                disabled={!watchedClienteId}
                onCreateNew={() => setModalProyecto(true)}
                createNewText="Crear nuevo proyecto..."
                emptyText={watchedClienteId && proyectosFiltrados.length === 0
                  ? "Este cliente no tiene proyectos aún. Creá uno nuevo."
                  : "No se encontraron resultados."
                }
                className={errors.proyecto_id ? "border-red-400" : ""}
              />
            )}
          />
          {errors.proyecto_id && <Err msg={errors.proyecto_id.message} />}
        </div>

        {/* Tarea */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tarea_id">Tarea</Label>
          <Controller
            name="tarea_id"
            control={control}
            render={({ field }) => (
              <Combobox
                options={tareas.map(t => ({ value: t.id, label: t.nombre + (t.categoria ? ` (${t.categoria})` : "") }))}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Seleccionar tarea..."
                onCreateNew={() => setModalTarea(true)}
                createNewText="Crear nueva tarea..."
                className={errors.tarea_id ? "border-red-400" : ""}
              />
            )}
          />
          {errors.tarea_id && <Err msg={errors.tarea_id.message} />}
        </div>

        {/* Fecha + Horas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fecha">Fecha</Label>
            <Input type="date" {...register("fecha")} className={errors.fecha ? "border-red-400" : ""} />
            {errors.fecha && <Err msg={errors.fecha.message} />}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="horas">Horas</Label>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Min 0.25</span>
            </div>
            <Input type="number" step="0.25" min="0.25" max="24"
              {...register("horas", { valueAsNumber: true })}
              className={errors.horas ? "border-red-400" : ""} placeholder="1.5" />
            {errors.horas && <Err msg={errors.horas.message} />}
          </div>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descripcion">Descripción del trabajo</Label>
          <Textarea {...register("descripcion")} rows={3}
            placeholder="Describe brevemente el trabajo realizado…"
            className={errors.descripcion ? "border-red-400" : ""} />
          {errors.descripcion && <Err msg={errors.descripcion.message} />}
        </div>

        {/* Price preview */}
        <AnimatePresence>
          {watchedProyectoId && watchedHoras > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-blue-500/10 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <DollarSign size={15} />
                  <span className="text-sm font-medium">Monto estimado</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-semibold font-mono text-primary">
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

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button type="submit" disabled={status === "loading" || status === "success"} className="flex-1">
            {status === "loading" && <Loader2 size={15} className="animate-spin mr-2" />}
            {status === "success" && <CheckCircle size={15} className="mr-2" />}
            {status === "idle" ? "Guardar registro" : status === "loading" ? "Guardando…" : status === "error" ? "Error al guardar" : "¡Guardado!"}
          </Button>
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>

      {/* Modal: Nuevo Cliente */}
      <Dialog open={modalCliente} onOpenChange={setModalCliente}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="c-nombre">Nombre *</Label>
              <Input id="c-nombre" value={newNombreC} onChange={(e) => setNewNombreC(e.target.value)} placeholder="Ej: Acumen Corp" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-email">Email de facturación *</Label>
              <Input id="c-email" value={newEmailC} onChange={(e) => setNewEmailC(e.target.value)} placeholder="admin@ejemplo.com" />
            </div>
          </div>
          {errC && <p className="text-red-500 text-sm">{errC}</p>}
          <DialogFooter>
            <Button onClick={handleCreateCliente} disabled={savingC || !newNombreC.trim() || !newEmailC.trim()} className="w-full">
              {savingC && <Loader2 size={14} className="animate-spin mr-2" />}
              Crear y seleccionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nuevo Proyecto */}
      <Dialog open={modalProyecto} onOpenChange={setModalProyecto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="p-nombre">Nombre del proyecto *</Label>
              <Input id="p-nombre" value={newNombreP} onChange={(e) => setNewNombreP(e.target.value)} placeholder="Ej: Rediseño web 2026" />
            </div>
            <p className="text-xs text-muted-foreground">Se creará con precios globales (${defaultConfig.precioBase}/${ defaultConfig.precioAlto}, umbral {defaultConfig.umbralHoras}h).</p>
          </div>
          {errP && <p className="text-red-500 text-sm">{errP}</p>}
          <DialogFooter>
            <Button onClick={handleCreateProyecto} disabled={savingP || !newNombreP.trim()} className="w-full">
              {savingP && <Loader2 size={14} className="animate-spin mr-2" />}
              Crear y seleccionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nueva Tarea */}
      <Dialog open={modalTarea} onOpenChange={setModalTarea}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva tarea</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="t-nombre">Nombre *</Label>
              <Input id="t-nombre" value={newNombreT} onChange={(e) => setNewNombreT(e.target.value)} placeholder="Ej: Desarrollo Backend" />
            </div>
          </div>
          {errT && <p className="text-red-500 text-sm">{errT}</p>}
          <DialogFooter>
            <Button onClick={handleCreateTarea} disabled={savingT || !newNombreT.trim()} className="w-full">
              {savingT && <Loader2 size={14} className="animate-spin mr-2" />}
              Crear y seleccionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Err({ msg }: { msg?: string }) {
  return <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {msg}</p>;
}
