"use client";

import type { DashboardNavLink } from "@/types";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface DashboardShellProps {
  sidebarTitle: string;
  navLinks: DashboardNavLink[];
  pageTitle: string;
  children: ReactNode;
}

export const DashboardShell = ({ sidebarTitle, navLinks, pageTitle, children }: DashboardShellProps) => {
  return (
    <div className="flex min-h-screen w-full bg-slate-100/70 dark:bg-slate-950">
      <Sidebar links={navLinks} title={sidebarTitle} />
      <div className="ml-0 flex w-full flex-1 flex-col md:ml-72">
        <TopBar title={pageTitle} />
        <main className="flex-1 space-y-8 p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
};
