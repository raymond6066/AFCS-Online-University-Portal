"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { UserProfile, UserRole } from "../../../../lib/schema";
import { listUserProfiles } from "../../../../services/data";
import { getUrl } from "aws-amplify/storage";

export default function AdminUsersPage() {
  const auth = useCurrentUserProfile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listUserProfiles();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load users.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    if (roleFilter === "ALL") return users;
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  const handleDownload = async (url?: string | null) => {
    if (!url) return;
    try {
      const key = new URL(url).pathname.replace(/^\//, "");
      const signed = await getUrl({ key, options: { expiresIn: 60 } });
      window.open(signed.url.toString(), "_blank");
    } catch (err) {
      console.error(err);
      alert("Unable to download document. Ensure S3 permissions are configured.");
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading users..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">User Management</h2>
        <select
          className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as UserRole | "ALL")}
        >
          <option value="ALL">All roles</option>
          <option value="STUDENT">Students</option>
          <option value="INSTRUCTOR">Instructors</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>
      <DataTable
        data={filteredUsers}
        columns={[
          { header: "Name", accessor: (user) => user.fullName ?? user.email },
          { header: "Email", accessor: (user) => user.email },
          { header: "Role", accessor: (user) => user.role },
          { header: "Department", accessor: (user) => user.department ?? "--" },
          {
            header: "Passport",
            accessor: (user) =>
              user.passportPhotoUrl ? (
                <button
                  className="text-primary-500"
                  onClick={() => handleDownload(user.passportPhotoUrl)}
                  type="button"
                >
                  View
                </button>
              ) : (
                "--"
              ),
          },
          {
            header: "Medical Record",
            accessor: (user) =>
              user.medicalRecordUrl ? (
                <button
                  className="text-primary-500"
                  onClick={() => handleDownload(user.medicalRecordUrl)}
                  type="button"
                >
                  Download
                </button>
              ) : (
                "--"
              ),
          },
        ]}
      />
    </div>
  );
}
