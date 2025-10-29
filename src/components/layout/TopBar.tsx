"use client";

import { useAuthContext } from "@/context/AuthContext";
import { DarkModeToggle } from "./DarkModeToggle";

export const TopBar = ({ title }: { title: string }) => {
  const { user, role, signOut } = useAuthContext();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/70 bg-white/70 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {role && (
          <p className="text-sm text-slate-500 dark:text-slate-300">Signed in as {role}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-100">
          <span>{user?.fullName ?? user?.email}</span>
          <button
            onClick={() => void signOut()}
            className="rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
