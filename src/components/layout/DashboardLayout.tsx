"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useMemo } from "react";
import { ROLE_LABEL } from "../../lib/roles";
import type { UserProfile, UserRole } from "../../lib/schema";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useCurrentUserProfile } from "../../hooks/useCurrentUserProfile";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export type DashboardLayoutProps = PropsWithChildren<{
  title: string;
  nav: NavItem[];
  role: UserRole;
  profile: UserProfile;
}>;

export function DashboardLayout({ title, nav, role, profile, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const auth = useCurrentUserProfile();

  const navItems = useMemo(() => nav, [nav]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-950">
      <aside className="hidden w-72 flex-col gap-2 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-widest text-primary-500">{ROLE_LABEL[role]}</p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-primary-500/10 text-primary-600 dark:bg-primary-400/20 dark:text-primary-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="h-5 w-5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={auth.signOutAndRedirect}
          className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary-500"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" type="button">
              <span className="sr-only">Open navigation</span>
            </button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <UserCircleIcon className="h-5 w-5" />
              <span>{profile.fullName ?? profile.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gray-100 p-4 dark:bg-slate-950 lg:p-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
