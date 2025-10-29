"use client";

import { useEffect, useState } from "react";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { UserProfile } from "../../../../lib/schema";
import { listUserProfiles } from "../../../../services/data";

export default function AdminDocumentsPage() {
  const auth = useCurrentUserProfile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listUserProfiles();
        setUsers(data.filter((user) => user.passportPhotoUrl || user.medicalRecordUrl));
      } catch (err) {
        console.error(err);
        setError("Unable to load documents.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (auth.loading || loading) {
    return <LoadingState label="Loading documents..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="section-title">Secure Documents</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="card space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user.fullName ?? user.email}
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-300">
              {user.passportPhotoUrl && (
                <li>Passport: {user.passportPhotoUrl}</li>
              )}
              {user.medicalRecordUrl && (
                <li>Medical record: {user.medicalRecordUrl}</li>
              )}
            </ul>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-slate-500">No documents uploaded yet.</p>}
      </div>
    </div>
  );
}
