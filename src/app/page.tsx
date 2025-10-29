"use client";

import { useAuthContext } from "@/context/AuthContext";
import Link from "next/link";
import { useMemo } from "react";

export default function HomePage() {
  const { user, loading, role, signIn, signOut } = useAuthContext();

  const dashboardHref = useMemo(() => {
    if (!role) return "/signup";
    return `/dashboard/${role.toLowerCase()}`;
  }, [role]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-20 text-center">
      <div className="space-y-4">
        <p className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          AFCS Online University ERP
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Manage courses, resources, and analytics with confidence.
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Secure role-based dashboards for students, instructors, and administrators powered by AWS Amplify Gen 2.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {!loading && !user && (
          <button
            onClick={() => void signIn()}
            className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            Sign in with Cognito Hosted UI
          </button>
        )}

        {!loading && user && (
          <button
            onClick={() => void signOut()}
            className="rounded-2xl border border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        )}

        {!loading && (
          <Link
            href={dashboardHref}
            className="rounded-2xl border border-primary/30 px-6 py-3 text-base font-semibold text-primary transition hover:bg-primary/10"
          >
            {role ? "Go to dashboard" : "Complete your profile"}
          </Link>
        )}
      </div>

      <section className="grid w-full gap-6 md:grid-cols-3">
        {["Course & assignment tracking", "Secure document management", "Real-time analytics"].map((feature) => (
          <div
            key={feature}
            className="rounded-3xl bg-white/80 p-6 text-left shadow-xl shadow-slate-900/5 backdrop-blur dark:bg-slate-900/60"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Harness Amplify Data, Auth, and Storage to keep your institution organized.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
