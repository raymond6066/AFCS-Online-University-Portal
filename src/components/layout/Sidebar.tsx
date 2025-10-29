"use client";

import type { DashboardNavLink } from "@/types";
import { clsx } from "clsx";
import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink } from "./NavLink";

interface SidebarProps {
  links: DashboardNavLink[];
  title: string;
}

export const Sidebar = ({ links, title }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="relative">
      <button
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-900/10 dark:bg-slate-900 md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
      </button>
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-72 transform bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur transition-all dark:bg-slate-900/80",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">AFCS Portal</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink key={link.href} link={link} />
          ))}
        </nav>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </aside>
  );
};
