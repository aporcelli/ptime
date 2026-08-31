"use client";
// components/forms/HorasForm.tsx
// Contenedor orquestador: delega lógica en useHorasForm y vista en componentes puros.
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useHorasForm } from "@/hooks/useHorasForm";
import { HorasFormFields } from "@/components/forms/horas/HorasFormFields";
import { PricingPreviewCard } from "@/components/forms/horas/PricingPreviewCard";
import { QuickCreateModals } from "@/components/forms/horas/QuickCreateModals";
import type { Tarea, Proyecto, Cliente, AppConfig } from "@/types/entities";
import type { HourFormData } from "@/lib/schemas/hour";

interface Props {
  clientes: Cliente[];
  tareas: Tarea[];
  proyectos: Proyecto[];
  defaultConfig: AppConfig;
  /** Total horas del usuario en el mes actual (todos los proyectos) */
  horasAcumuladasMes: number;
  initialData?: HourFormData & { id: string };
  sheetId?: string;
}

export default function HorasForm({
  clientes, tareas, proyectos, defaultConfig, horasAcumuladasMes, initialData, sheetId,
}: Props) {
  const { t } = useLocale();

  const {
    // form
    register, handleSubmit, control, errors,
    watchedClienteId, watchedProyectoId, watchedHoras,
    clientesOrdenados, tareasOrdenadas, proyectosFiltrados,
    // estado
    status, serverError, debugError, previewAmount, debugMode,
    // pricing derivado
    selectedP, umbral, appliedRate, isHighTier,
    // acciones
    onSubmit, setModalCliente, setModalProyecto, setModalTarea,
    // modales
    modalCliente, modalProyecto, modalTarea,
    newNombreC, setNewNombreC, newEmailC, setNewEmailC,
    newNombreP, setNewNombreP, newNombreT, setNewNombreT,
    savingC, savingP, savingT, errC, errP, errT,
    handleCreateCliente, handleCreateProyecto, handleCreateTarea,
  } = useHorasForm({ clientes, tareas, proyectos, defaultConfig, horasAcumuladasMes, initialData, sheetId });

  const tierName = isHighTier ? t.highRate : t.baseRate;

  const buttonConfig = {
    idle: { label: t.saveRecord, disabled: false },
    loading: { label: t.saving, disabled: true },
    success: { label: t.saved, disabled: true },
    error: { label: t.retry, disabled: false },
  } as const;
  const currentButton = buttonConfig[status];

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-card text-card-foreground rounded-2xl border border-border p-6 md:p-8 flex flex-col gap-6" noValidate>
        <HorasFormFields
          control={control}
          register={register}
          errors={errors}
          clientes={clientesOrdenados}
          proyectos={proyectosFiltrados}
          tareas={tareasOrdenadas}
          watchedClienteId={watchedClienteId}
          watchedProyectoId={watchedProyectoId}
          onOpenCliente={() => setModalCliente(true)}
          onOpenProyecto={() => setModalProyecto(true)}
          onOpenTarea={() => setModalTarea(true)}
          t={{
            client: t.client,
            selectClient: t.selectClient,
            newClient: t.newClient,
            project: t.project,
            selectProject: t.selectProject,
            selectClientFirst: t.selectClientFirst,
            newProject: t.newProject,
            task: t.task,
            selectTask: t.selectTask,
            newTask: t.newTask,
            date: t.date,
            hours: t.hours,
            minHours: t.minHours,
            description: t.description,
            descriptionPlaceholder: t.descriptionPlaceholder,
            noProjectsYet: "Este cliente no tiene proyectos aún. Creá uno nuevo.",
            noResults: "No se encontraron resultados.",
          }}
        />

        {/* Price preview */}
        <PricingPreviewCard
          show={Boolean(watchedProyectoId && watchedHoras > 0)}
          previewAmount={previewAmount}
          selectedP={selectedP ?? undefined}
          horasAcumuladasMes={horasAcumuladasMes}
          umbral={umbral}
          appliedRate={appliedRate}
          tierName={tierName}
          defaultConfig={defaultConfig}
          t={{ estimatedAmount: t.estimatedAmount, monthlyAcum: t.monthlyAcum, threshold: t.threshold }}
        />

        {serverError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle size={15} className="shrink-0" /> {serverError}
          </div>
        )}

        {debugMode && debugError && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold mb-2">Debug save error</p>
            <pre className="whitespace-pre-wrap break-words">{debugError}</pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button type="submit" disabled={currentButton.disabled} className="flex-1">
            {status === "loading" && <Loader2 size={15} className="animate-spin mr-2" />}
            {status === "success" && <CheckCircle size={15} className="mr-2" />}
            {status === "error" && <AlertCircle size={15} className="mr-2" />}
            {currentButton.label}
          </Button>
          <Button variant="outline" type="button" onClick={() => window.history.back()}>
            {t.cancel}
          </Button>
        </div>
      </form>

      <QuickCreateModals
        modalCliente={modalCliente}
        setModalCliente={setModalCliente}
        newNombreC={newNombreC}
        setNewNombreC={setNewNombreC}
        newEmailC={newEmailC}
        setNewEmailC={setNewEmailC}
        savingC={savingC}
        errC={errC}
        onCreateCliente={handleCreateCliente}
        modalProyecto={modalProyecto}
        setModalProyecto={setModalProyecto}
        newNombreP={newNombreP}
        setNewNombreP={setNewNombreP}
        savingP={savingP}
        errP={errP}
        onCreateProyecto={handleCreateProyecto}
        modalTarea={modalTarea}
        setModalTarea={setModalTarea}
        newNombreT={newNombreT}
        setNewNombreT={setNewNombreT}
        savingT={savingT}
        errT={errT}
        onCreateTarea={handleCreateTarea}
        defaultConfig={defaultConfig}
      />
    </>
  );
}
