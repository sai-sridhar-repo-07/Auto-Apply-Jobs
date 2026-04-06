"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Search, Briefcase, FileText,
  MessageSquare, DollarSign, Settings, Zap, PenLine,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Discover Jobs", icon: Search },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/apply", label: "Apply Assist", icon: PenLine },
  { href: "/followup", label: "Follow-ups", icon: MessageSquare },
  { href: "/interview", label: "Interview Prep", icon: FileText },
  { href: "/negotiate", label: "Negotiations", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full" style={{ background: "#0f172a" }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">AutoApply</p>
            <p className="text-xs leading-tight" style={{ color: "#475569" }}>AI Job Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: "#334155" }}>
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium group",
                active
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={active
                ? { background: "linear-gradient(135deg, #6366f1, #818cf8)", color: "white", boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }
                : { color: "#64748b" }
              }
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "#1e293b"; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="rounded-lg px-3 py-2.5" style={{ background: "#1e293b" }}>
          <p className="text-xs font-medium" style={{ color: "#475569" }}>Config file</p>
          <code className="text-xs font-mono" style={{ color: "#6366f1" }}>config/profile.yml</code>
        </div>
      </div>
    </aside>
  );
}
