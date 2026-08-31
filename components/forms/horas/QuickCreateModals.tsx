"use client";
// components/forms/horas/QuickCreateModals.tsx
// Modales de creación rápida (Cliente, Proyecto, Tarea) — presentacional puro.
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AppConfig } from "@/types/entities";

export interface QuickCreateModalsProps {
  // Cliente
  modalCliente: boolean;
  setModalCliente: (v: boolean) => void;
  newNombreC: string;
  setNewNombreC: (v: string) => void;
  newEmailC: string;
  setNewEmailC: (v: string) => void;
  savingC: boolean;
  errC: string;
  onCreateCliente: () => void;
  // Proyecto
  modalProyecto: boolean;
  setModalProyecto: (v: boolean) => void;
  newNombreP: string;
  setNewNombreP: (v: string) => void;
  savingP: boolean;
  errP: string;
  onCreateProyecto: () => void;
  // Tarea
  modalTarea: boolean;
  setModalTarea: (v: boolean) => void;
  newNombreT: string;
  setNewNombreT: (v: string) => void;
  savingT: boolean;
  errT: string;
  onCreateTarea: () => void;
  // Config para el copy del proyecto
  defaultConfig: AppConfig;
}

export function QuickCreateModals(props: QuickCreateModalsProps) {
  const {
    modalCliente, setModalCliente, newNombreC, setNewNombreC, newEmailC, setNewEmailC,
    savingC, errC, onCreateCliente,
    modalProyecto, setModalProyecto, newNombreP, setNewNombreP, savingP, errP, onCreateProyecto,
    modalTarea, setModalTarea, newNombreT, setNewNombreT, savingT, errT, onCreateTarea,
    defaultConfig,
  } = props;

  return (
    <>
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
            <Button onClick={onCreateCliente} disabled={savingC || !newNombreC.trim() || !newEmailC.trim()} className="w-full">
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
            <p className="text-xs text-muted-foreground">
              Se creará con precios globales (${defaultConfig.precioBase}/${defaultConfig.precioAlto}, umbral {defaultConfig.umbralHoras}h).
            </p>
          </div>
          {errP && <p className="text-red-500 text-sm">{errP}</p>}
          <DialogFooter>
            <Button onClick={onCreateProyecto} disabled={savingP || !newNombreP.trim()} className="w-full">
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
            <Button onClick={onCreateTarea} disabled={savingT || !newNombreT.trim()} className="w-full">
              {savingT && <Loader2 size={14} className="animate-spin mr-2" />}
              Crear y seleccionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
