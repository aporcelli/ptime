// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Clock,
  BarChart3,
  Users,
  FolderKanban,
  CheckSquare,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/index";

interface NavItem {
  href:      string;
  label:     string;
  icon:      React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard",         label: "Dashboard",     icon: <LayoutDashboard size={18} /> },
  { href: "/horas",             label: "Mis Horas",     icon: <Clock size={18} /> },
  { href: "/reportes",          label: "Reportes",      icon: <BarChart3 size={18} /> },
  // Admin
  { href: "/admin/clientes",    label: "Clientes",      icon: <Users size={18} />,        adminOnly: true },
  { href: "/admin/proyectos",   label: "Proyectos",     icon: <FolderKanban size={18} />, adminOnly: true },
  { href: "/admin/tareas",      label: "Tareas",        icon: <CheckSquare size={18} />,  adminOnly: true },
  { href: "/admin/configuracion", label: "Configuración", icon: <Settings size={18} />,   adminOnly: true },
];

interface Props {
  role: "USER" | "ADMIN";
}

export default function Sidebar({ role }: Props) {
  const pathname    = usePathname();
  const visibleItems = navItems.filter((item) => !item.adminOnly || role === "ADMIN");

  const userItems  = visibleItems.filter((i) => !i.adminOnly);
  const adminItems = visibleItems.filter((i) => i.adminOnly);

  return (
    <aside
      className="hidden md:flex flex-col w-[240px] shrink-0 bg-ink h-full"
      aria-label="Navegación principal"
    >
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-800">
        <span className="font-serif text-4xl text-white">
          P<span className="text-warm-500 italic">time</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavGroup items={userItems} pathname={pathname} />

        {adminItems.length > 0 && (
          <>
            <div className="px-3 py-2 mt-4 mb-1">
              <span className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest font-mono">
                Administración
              </span>
            </div>
            <NavGroup items={adminItems} pathname={pathname} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-800">
        <p className="text-slate-700 text-[10px] font-mono text-center">
          Ptime v0.1.0
        </p>
      </div>
    </aside>
  );
}

function NavGroup({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-brand-600 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className={cn("shrink-0", isActive ? "text-white" : "text-slate-500 group-hover:text-white")}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto opacity-60" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
