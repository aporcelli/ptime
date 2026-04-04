import type { Metadata } from "next";
import { getTareas } from "@/lib/sheets/queries";
import { getPageCtx } from "@/lib/sheets/getPageCtx";
import TareasAdmin from "./TareasAdmin";

export const metadata: Metadata = { title: "Tareas" };
export const revalidate = 60;

export default async function TareasPage() {
  const ctx    = await getPageCtx();
  const tareas = await getTareas(ctx);
  return <TareasAdmin tareas={tareas} />;
}
