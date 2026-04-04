import type { Metadata } from "next";
import { getClientes } from "@/lib/sheets/queries";
import { getPageCtx }  from "@/lib/sheets/getPageCtx";
import ClientesAdmin   from "./ClientesAdmin";

export const metadata: Metadata = { title: "Clientes" };
export const revalidate = 60;

export default async function ClientesPage() {
  const ctx      = await getPageCtx();
  const clientes = await getClientes(ctx);
  return <ClientesAdmin clientes={clientes} />;
}
