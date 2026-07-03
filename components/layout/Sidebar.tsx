"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Clock, BarChart3, Users, FolderKanban, CheckSquare, Settings, UserCog, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/index";
import { useState, useEffect } from "react";
import type { Locale } from "@/lib/onboarding-i18n";
import { dashboardTranslations } from "@/lib/dashboard-i18n";

const navItems = [
  { href: "/dashboard",           label: "Dashboard",   icon: <LayoutDashboard size={18} /> },
  { href: "/horas",               label: "Mis Horas",   icon: <Clock size={18} /> },
  { href: "/reportes",            label: "Reportes",    icon: <BarChart3 size={18} /> },
];

const adminItems = [
  { href: "/admin/clientes",      label: "Clientes",      icon: <Users size={18} />,        adminOnly: false },
  { href: "/admin/proyectos",     label: "Proyectos",     icon: <FolderKanban size={18} />, adminOnly: false },
  { href: "/admin/tareas",        label: "Tareas",        icon: <CheckSquare size={18} />,  adminOnly: false },
  { href: "/admin/workspace",     label: "Workspace",     icon: <UserCog size={18} />,      adminOnly: false },
  { href: "/admin/usuarios",      label: "Usuarios",      icon: <UserCog size={18} />,      adminOnly: true  },
  { href: "/admin/configuracion", label: "Configuración", icon: <Settings size={18} />,     adminOnly: false },
];

interface SidebarProps {
  role: string;
  onNavClick?: () => void;
}

export default function Sidebar({ role, onNavClick }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin  = role === "ADMIN";
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const checkLocale = () => {
      const saved = localStorage.getItem("ptime-locale") as Locale | null;
      if (saved === "en" || saved === "es") setLocale(saved);
    };
    checkLocale();
    const interval = setInterval(checkLocale, 500);
    return () => clearInterval(interval);
  }, []);

  const t = dashboardTranslations[locale];

  const getLabel = (href: string) => {
    switch (href) {
      case "/dashboard": return t.menuDashboard;
      case "/horas": return t.menuHoras;
      case "/reportes": return t.menuReportes;
      case "/admin/clientes": return t.menuClientes;
      case "/admin/proyectos": return t.menuProyectos;
      case "/admin/tareas": return t.menuTareas;
      case "/admin/workspace": return t.menuWorkspace;
      case "/admin/usuarios": return t.menuUsuarios;
      case "/admin/configuracion": return t.menuConfiguracion;
      default: return "";
    }
  };

  return (
    <aside className="flex flex-col w-[220px] shrink-0 h-full bg-card border-r border-border" aria-label="Navegación">
      {/* Logo */}
      <div className="px-6 py-5">
        <span className="font-display text-2xl font-extrabold tracking-tight">
          P<span className="text-emerald-500">time</span>
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto flex flex-col gap-0.5">
        {navItems.map((item) => (
              <NavItem key={item.href} item={{...item, label: getLabel(item.href)}} pathname={pathname} onNavClick={onNavClick} />
            ))}

        <div className="px-3 pt-5 pb-1">
          <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
            {t.menuAdministration}
          </span>
        </div>

        {adminItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => (
                <NavItem key={item.href} item={{...item, label: getLabel(item.href)}} pathname={pathname} onNavClick={onNavClick} />
              ))}
      </nav>

      <div className="px-4 py-4 flex flex-col items-center gap-3 border-t border-border mt-auto">
        <a
          href="https://tucloud.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
          title="Visitar TuCloud.pro"
        >
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Powered by</span>
          <div className="bg-black px-3 py-2 rounded-lg border border-border shadow-sm">
            <img
              src="/logo_tucloud_white.png"
              alt="TU CLOUD PRO"
              className="h-6 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span style="color:white; font-size:11px; font-weight:bold; letter-spacing:1px;">TU CLOUD PRO</span>';
              }}
            />
          </div>
        </a>
        <p className="text-muted-foreground opacity-50 text-[10px] text-center">Ptime v1.2.49</p>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: { href: string; label: string; icon: React.ReactNode };
  pathname: string;
  onNavClick?: () => void;
}

function NavItem({ item, pathname, onNavClick }: NavItemProps) {
  const isActive = item.href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(item.href);

  const tourKey = item.href === "/dashboard" ? "sidebar-dashboard" :
                  item.href === "/horas" ? "sidebar-horas" :
                  item.href === "/admin/clientes" ? "sidebar-clientes" :
                  item.href === "/admin/proyectos" ? "sidebar-proyectos" :
                  item.href === "/admin/tareas" ? "sidebar-tareas" :
                  item.href === "/admin/configuracion" ? "sidebar-configuracion" : undefined;

  return (
    <Link
      href={item.href}
      onClick={onNavClick}
      data-tour={tourKey}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group",
        isActive
          ? "text-foreground font-semibold"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-accent rounded-lg -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
        />
      )}
      <span className={cn(
        "shrink-0 transition-colors",
        isActive ? "text-emerald-500" : "text-muted-foreground group-hover:text-emerald-500"
      )}>
        {item.icon}
      </span>
      <span className="font-medium">{item.label}</span>
      {isActive && <ChevronRight size={13} className="ml-auto opacity-60" />}
    </Link>
  );
}
