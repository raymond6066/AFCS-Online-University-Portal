"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { client } from "@/lib/amplifyClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type User = {
  id: string;
  fullName?: string | null;
  email: string;
  role: string;
  department?: string | null;
};

const roleFilters = ["ALL", "STUDENT", "INSTRUCTOR", "ADMIN"] as const;

type RoleFilter = (typeof roleFilters)[number];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.UserProfile.list({});
      setUsers((data ?? []) as User[]);
    } catch (err) {
      console.error(err);
      setError("Unable to load user profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesSearch = search
        ? (user.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  return (
    <RoleDashboard role="ADMIN" title="User management">
      {loading && <LoadingState message="Loading user profiles..." />}
      {error && !loading && <ErrorState message={error} onRetry={loadUsers} />}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Search</label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Role filter</label>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {roleFilters.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <SimpleTable
            columns={[
              {
                header: "Name",
                accessor: (item: User) => item.fullName ?? "--",
              },
              { header: "Email", accessor: (item: User) => item.email },
              { header: "Role", accessor: (item: User) => item.role },
              {
                header: "Department",
                accessor: (item: User) => item.department ?? "--",
              },
              {
                header: "",
                accessor: (item: User) => (
                  <Link
                    href={`/dashboard/admin/users/${item.id}`}
                    className="inline-flex items-center rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    View
                  </Link>
                ),
              },
            ]}
            data={filtered}
            emptyMessage="No users found."
          />
        </div>
      )}
    </RoleDashboard>
  );
}
