// app/(dashboard)/admin/clientes/page.tsx
import type { Metadata } from "next";
import { getClientes } from "@/lib/sheets/queries";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

export const metadata: Metadata = { title: "Clientes" };
export const revalidate = 60;

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Clientes</h1>
          <p className="text-muted-foreground mt-1">{clientes.length} clientes registrados</p>
        </div>
        <button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {clientes.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No hay clientes aún.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                {["Nombre", "Email", "Teléfono", "Estado"].map((h) => (
                  <th key={h} className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="p-3 font-medium text-ink">{c.nombre}</td>
                  <td className="p-3 text-muted-foreground">{c.email}</td>
                  <td className="p-3 text-muted-foreground">{c.telefono ?? "—"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
