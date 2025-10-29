"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt?: string;
};

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await client.models.Announcement.list({
          filter: {
            or: [
              { audience: { eq: "ALL" } },
              { audience: { eq: "STUDENT" } },
            ],
          },
        });
        setAnnouncements((data ?? []) as Announcement[]);
      } catch (err) {
        console.error(err);
        setError("Unable to load announcements.");
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncements();
  }, []);

  return (
    <RoleDashboard role="STUDENT" title="Announcements">
      {loading && <LoadingState message="Loading announcements..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow dark:border-slate-800 dark:bg-slate-900/70"
            >
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{announcement.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{announcement.body}</p>
              <p className="mt-3 text-xs text-slate-400">
                Audience: {announcement.audience} • {announcement.createdAt && new Date(announcement.createdAt).toLocaleString()}
              </p>
            </article>
          ))}
          {announcements.length === 0 && (
            <p className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              No announcements have been posted.
            </p>
          )}
        </div>
      )}
    </RoleDashboard>
  );
}
