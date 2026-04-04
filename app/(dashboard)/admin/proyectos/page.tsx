import type { Metadata } from "next";
import { getProyectos, getClientes } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import ProyectosAdmin from "./ProyectosAdmin";

export const metadata: Metadata = { title: "Proyectos" };
export const revalidate = 60;

export default async function ProyectosPage() {
  const ctx = await getPageCtx();
  const [proyectos, clientes] = await Promise.all([
    getProyectos(ctx),
    getClientes(ctx),
  ]);
  return <ProyectosAdmin proyectos={proyectos} clientes={clientes} />;
}
