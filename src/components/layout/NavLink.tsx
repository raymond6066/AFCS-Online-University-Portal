"use client";

import type { DashboardNavLink } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export const NavLink = ({ link }: { link: DashboardNavLink }) => {
  const pathname = usePathname();
  const isActive = pathname === link.href;

  return (
    <Link
      href={link.href}
      className={clsx(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
        isActive
          ? "bg-primary/15 text-primary shadow-inner"
          : "text-slate-500 hover:bg-slate-200/40 dark:text-slate-300 dark:hover:bg-slate-800/60"
      )}
    >
      <span className="text-lg">{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  );
};
