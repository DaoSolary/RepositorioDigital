"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tccs", label: "Trabalhos" },
  { href: "/admin/users", label: "Usuários" },
  { href: "/admin/activity", label: "Atividade" },
  { href: "/admin/audit", label: "Auditoria" },
  { href: "/admin/backup", label: "Backup" },
  { href: "/admin/api-keys", label: "API Keys" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="surface-card flex flex-wrap gap-1 rounded-2xl p-1.5">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
