"use client";
// hooks/useHorasForm.ts
// Lógica de formulario y cálculo reactivo de HorasForm (extraída del contenedor).
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hourFormSchema, type HourFormData } from "@/lib/schemas/hour";
import { previewMonto } from "@/lib/pricing/calculateHoursAmount";
import { createProyectoAction } from "@/app/actions/projects";
import { createTareaAction } from "@/app/actions/tasks";
import { createClienteAction } from "@/app/actions/clients";
import { createHour, updateHourAction } from "@/app/actions/hours";
import type { Tarea, Proyecto, Cliente, AppConfig } from "@/types/entities";

export type SaveStatus = "idle" | "loading" | "success" | "error";

export interface HorasFormData {
  clientes: Cliente[];
  tareas: Tarea[];
  proyectos: Proyecto[];
  defaultConfig: AppConfig;
  horasAcumuladasMes: number;
  initialData?: HourFormData & { id: string };
  sheetId?: string;
}

export const sortByNombre = <T extends { nombre: string }>(items: T[]) =>
  [...items].sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

export function useHorasForm({
  clientes: initClientes,
  tareas: initTareas,
  proyectos: initProyectos,
  defaultConfig,
  horasAcumuladasMes,
  initialData,
  sheetId,
}: HorasFormData) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debugMode = searchParams.get("debug") === "1";

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [previewAmount, setPreviewAmount] = useState(0);
  const [clientes, setClientes] = useState(initClientes);
  const [proyectos, setProyectos] = useState(initProyectos);
  const [tareas, setTareas] = useState(initTareas);

  // Inline modal states
  const [modalCliente, setModalCliente] = useState(false);
  const [modalProyecto, setModalProyecto] = useState(false);
  const [modalTarea, setModalTarea] = useState(false);
  const [newNombreC, setNewNombreC] = useState("");
  const [newEmailC, setNewEmailC] = useState("");
  const [newNombreP, setNewNombreP] = useState("");
  const [newNombreT, setNewNombreT] = useState("");
  const [savingC, setSavingC] = useState(false);
  const [savingP, setSavingP] = useState(false);
  const [savingT, setSavingT] = useState(false);
  const [errC, setErrC] = useState("");
  const [errP, setErrP] = useState("");
  const [errT, setErrT] = useState("");

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

  const watchedClienteId = watch("cliente_id");
  const watchedProyectoId = watch("proyecto_id");
  const watchedTareaId = watch("tarea_id");
  const watchedHoras = watch("horas");

  const clientesOrdenados = useMemo(() => sortByNombre(clientes), [clientes]);
  const tareasOrdenadas = useMemo(() => sortByNombre(tareas), [tareas]);

  // Si el proyecto no tiene cliente_id asignado en el Sheet, lo mostramos igual
  const proyectosFiltrados = useMemo(() => (
    sortByNombre(
      proyectos.filter((p) => {
        const pid = p.cliente_id.trim();
        return !watchedClienteId || pid === "" || pid.toLowerCase() === watchedClienteId.trim().toLowerCase();
      })
    )
  ), [proyectos, watchedClienteId]);

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
      precioBase: p.precio_base || defaultConfig.precioBase,
      precioAlto: p.precio_alto || defaultConfig.precioAlto,
      umbralHoras: p.umbral_precio_alto || defaultConfig.umbralHoras,
    }));
  }, [watchedProyectoId, watchedHoras, proyectos, defaultConfig, horasAcumuladasMes]);

  const goToHoras = useCallback(() => {
    setStatus("success");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/horas";
        return;
      }
      router.push("/horas");
    }, 800);
  }, [router]);

  async function onSubmit(data: HourFormData) {
    setStatus("loading");
    setServerError(null);
    setDebugError(null);

    try {
      const result = initialData
        ? await updateHourAction(initialData.id, data)
        : await createHour(data);

      if (!result.success) {
        setStatus("error");

        if (result.error === "NO_SESSION" || result.error === "No autenticado") {
          router.push("/login");
          return;
        }

        if (result.error === "NO_SHEET_CONFIGURED") {
          setServerError("Tu workspace no está configurado. Abrí Setup y vinculá tu Google Sheet.");
          return;
        }

        setServerError(result.error || "Error del servidor");
        if (debugMode) {
          setDebugError(JSON.stringify({
            source: "server-action",
            error: result.error,
            debug: result.debug ?? null,
          }, null, 2));
        }
        return;
      }

      goToHoras();
    } catch (err: any) {
      const isRscRenderError = typeof err?.message === "string" && err.message.includes("Server Components render");

      if (isRscRenderError) {
        try {
          const res = await fetch("/api/horas", {
            method: initialData ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(initialData ? { id: initialData.id, ...data, sheetId } : { ...data, sheetId }),
          });
          const rawBody = await res.text();
          let payload: any = null;
          try {
            payload = rawBody ? JSON.parse(rawBody) : null;
          } catch {
            payload = null;
          }

          if (res.ok && payload?.success) {
            if (debugMode) {
              setDebugError(JSON.stringify({
                source: "api-fallback",
                note: "Server Action falló en transporte RSC; guardado completado por /api/horas",
              }, null, 2));
            }
            goToHoras();
            return;
          }

          setStatus("error");
          setServerError(payload?.error || `Error API fallback (${res.status})`);
          if (debugMode) {
            const staticExportDetected = rawBody.includes("\"nextExport\":true") || rawBody.includes("\"nextExport\": true");
            setDebugError(JSON.stringify({
              source: "api-fallback",
              status: res.status,
              payload,
              rawBody: rawBody?.slice(0, 2000) ?? null,
              staticExportDetected,
              hint: staticExportDetected ? "Deploy parece static export (nextExport:true). /api y Server Actions no corren en runtime." : null,
              originalDigest: err?.digest ?? null,
            }, null, 2));
          }
          return;
        } catch (fallbackErr: any) {
          setStatus("error");
          setServerError(fallbackErr?.message || "Error en fallback API");
          if (debugMode) {
            setDebugError(JSON.stringify({
              source: "api-fallback-catch",
              name: fallbackErr?.name ?? null,
              message: fallbackErr?.message ?? null,
              originalDigest: err?.digest ?? null,
            }, null, 2));
          }
          return;
        }
      }

      setStatus("error");
      setServerError(err?.message || "Error grave de conexión al guardar.");
      if (debugMode) {
        setDebugError(JSON.stringify({
          source: "client-catch",
          name: err?.name ?? null,
          message: err?.message ?? null,
          digest: err?.digest ?? null,
          stack: err?.stack ? String(err.stack).split("\n").slice(0, 8) : null,
        }, null, 2));
      }
    }
  }

  async function handleCreateCliente() {
    if (!newNombreC.trim() || !newEmailC.trim()) return;
    setSavingC(true); setErrC("");
    const res = await createClienteAction({ nombre: newNombreC, email: newEmailC, activo: true });
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

  // Pricing derivado para la tarjeta de preview
  const selectedP = proyectos.find((p) => p.id === watchedProyectoId);
  const umbral = selectedP?.umbral_precio_alto || defaultConfig.umbralHoras;
  const pBase = selectedP?.precio_base || defaultConfig.precioBase;
  const pAlto = selectedP?.precio_alto || defaultConfig.precioAlto;
  const isHighTier = horasAcumuladasMes >= umbral;
  const appliedRate = isHighTier ? pAlto : pBase;

  return {
    // form
    register, handleSubmit, watch, setValue, control, errors,
    watchedClienteId, watchedProyectoId, watchedTareaId, watchedHoras,
    clientesOrdenados, tareasOrdenadas, proyectosFiltrados,
    // estado
    status, serverError, debugError, previewAmount, debugMode,
    // pricing derivado
    selectedP, umbral, pBase, pAlto, isHighTier, appliedRate,
    // acciones
    onSubmit, goToHoras,
    // modales
    modalCliente, setModalCliente,
    modalProyecto, setModalProyecto,
    modalTarea, setModalTarea,
    newNombreC, setNewNombreC,
    newEmailC, setNewEmailC,
    newNombreP, setNewNombreP,
    newNombreT, setNewNombreT,
    savingC, savingP, savingT,
    errC, errP, errT,
    handleCreateCliente, handleCreateProyecto, handleCreateTarea,
  };
}
