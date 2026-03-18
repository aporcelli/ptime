"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Clock, BarChart3, Users, FolderKanban, CheckSquare, Settings, UserCog, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/index";

const navItems = [
  { href: "/dashboard",           label: "Dashboard",   icon: <LayoutDashboard size={18} /> },
  { href: "/horas",               label: "Mis Horas",   icon: <Clock size={18} /> },
  { href: "/reportes",            label: "Reportes",    icon: <BarChart3 size={18} /> },
];

const adminItems = [
  { href: "/admin/clientes",      label: "Clientes",    icon: <Users size={18} />,       adminOnly: false },
  { href: "/admin/proyectos",     label: "Proyectos",   icon: <FolderKanban size={18} />, adminOnly: false },
  { href: "/admin/tareas",        label: "Tareas",      icon: <CheckSquare size={18} />,  adminOnly: false },
  { href: "/admin/usuarios",      label: "Usuarios",    icon: <UserCog size={18} />,      adminOnly: true  },
  { href: "/admin/configuracion", label: "Configuración", icon: <Settings size={18} />,  adminOnly: false },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const isAdmin  = role === "ADMIN";

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-ink h-full" aria-label="Navegación">
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="font-serif text-4xl text-white">P<span className="text-warm-500 italic">time</span></span>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto flex flex-col gap-0.5">
        {navItems.map((item) => <NavItem key={item.href} item={item} pathname={pathname} />)}

        <div className="px-3 pt-4 pb-1">
          <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest font-mono">Administración</span>
        </div>

        {adminItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => <NavItem key={item.href} item={item} pathname={pathname} />)}
      </nav>

      <div className="px-3 py-3 border-t border-slate-800">
        <p className="text-slate-700 text-[10px] font-mono text-center">Ptime v0.1</p>
      </div>
    </aside>
  );
}

function NavItem({ item, pathname }: { item: { href: string; label: string; icon: React.ReactNode }; pathname: string }) {
  const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
  return (
    <Link href={item.href}
      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group",
        isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-800")}>
      {isActive && (
        <motion.div layoutId="activeNav" className="absolute inset-0 bg-brand-600 rounded-lg -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.35 }} />
      )}
      <span className={cn("shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-white")}>{item.icon}</span>
      <span className="font-medium">{item.label}</span>
      {isActive && <ChevronRight size={13} className="ml-auto opacity-60" />}
    </Link>
  );
}
