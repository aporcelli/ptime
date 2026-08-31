"use client";
// components/forms/horas/HorasFormFields.tsx
// Campos del formulario de horas — presentacional puro (recibe register/control del hook).
import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import type { HourFormData } from "@/lib/schemas/hour";
import type { Tarea, Proyecto, Cliente } from "@/types/entities";

export interface HorasFormFieldsProps {
  control: Control<HourFormData>;
  register: UseFormRegister<HourFormData>;
  errors: FieldErrors<HourFormData>;
  clientes: Cliente[];
  proyectos: Proyecto[];
  tareas: Tarea[];
  watchedClienteId: string;
  watchedProyectoId: string;
  onOpenCliente: () => void;
  onOpenProyecto: () => void;
  onOpenTarea: () => void;
  t: {
    client: string;
    selectClient: string;
    newClient: string;
    project: string;
    selectProject: string;
    selectClientFirst: string;
    newProject: string;
    task: string;
    selectTask: string;
    newTask: string;
    date: string;
    hours: string;
    minHours: string;
    description: string;
    descriptionPlaceholder: string;
    noProjectsYet: string;
    noResults: string;
  };
}

function Err({ msg }: { msg?: string }) {
  return <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle size={10} /> {msg}</p>;
}

export function HorasFormFields({
  control, register, errors,
  clientes, proyectos, tareas,
  watchedClienteId, watchedProyectoId,
  onOpenCliente, onOpenProyecto, onOpenTarea,
  t,
}: HorasFormFieldsProps) {
  return (
    <>
      {/* Cliente */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cliente_id">{t.client}</Label>
        <Controller
          name="cliente_id"
          control={control}
          render={({ field }) => (
            <Combobox
              options={clientes.map(c => ({ value: c.id, label: c.nombre }))}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t.selectClient}
              onCreateNew={onOpenCliente}
              createNewText={`${t.newClient}...`}
              className={errors.cliente_id ? "border-red-400" : ""}
            />
          )}
        />
        {errors.cliente_id && <Err msg={errors.cliente_id.message} />}
      </div>

      {/* Proyecto */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="proyecto_id">{t.project}</Label>
        <Controller
          name="proyecto_id"
          control={control}
          render={({ field }) => (
            <Combobox
              options={proyectos.map(p => ({ value: p.id, label: `${p.nombre} (${p.horas_acumuladas}h)` }))}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={watchedClienteId ? t.selectProject : t.selectClientFirst}
              disabled={!watchedClienteId}
              onCreateNew={onOpenProyecto}
              createNewText={`${t.newProject}...`}
              emptyText={watchedClienteId && proyectos.length === 0
                ? t.noProjectsYet
                : t.noResults
              }
              className={errors.proyecto_id ? "border-red-400" : ""}
            />
          )}
        />
        {errors.proyecto_id && <Err msg={errors.proyecto_id.message} />}
      </div>

      {/* Tarea */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tarea_id">{t.task}</Label>
        <Controller
          name="tarea_id"
          control={control}
          render={({ field }) => (
            <Combobox
              options={tareas.map(tItem => ({ value: tItem.id, label: tItem.nombre + (tItem.categoria ? ` (${tItem.categoria})` : "") }))}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t.selectTask}
              onCreateNew={onOpenTarea}
              createNewText={`${t.newTask}...`}
              className={errors.tarea_id ? "border-red-400" : ""}
            />
          )}
        />
        {errors.tarea_id && <Err msg={errors.tarea_id.message} />}
      </div>

      {/* Fecha + Horas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fecha">{t.date}</Label>
          <Input type="date" {...register("fecha")} className={errors.fecha ? "border-red-400" : ""} />
          {errors.fecha && <Err msg={errors.fecha.message} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="horas">{t.hours}</Label>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{t.minHours}</span>
          </div>
          <Input type="number" step="0.25" min="0.25" max="24"
            {...register("horas", { valueAsNumber: true })}
            className={errors.horas ? "border-red-400" : ""} placeholder="1.5" />
          {errors.horas && <Err msg={errors.horas.message} />}
        </div>
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descripcion">{t.description}</Label>
        <Textarea {...register("descripcion")} rows={3}
          placeholder={t.descriptionPlaceholder}
          className={errors.descripcion ? "border-red-400" : ""} />
        {errors.descripcion && <Err msg={errors.descripcion.message} />}
      </div>

      {watchedProyectoId && <span className="sr-only">proyecto activo</span>}
    </>
  );
}
