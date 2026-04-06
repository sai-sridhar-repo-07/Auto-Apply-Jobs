"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  MessageSquare,
  DollarSign,
  Settings,
  Zap,
  PenLine,
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
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base tracking-tight">AutoApply</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 leading-tight">
          AI-powered job applications
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Configure in{" "}
          <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs">
            config/profile.yml
          </code>
        </p>
      </div>
    </aside>
  );
}
