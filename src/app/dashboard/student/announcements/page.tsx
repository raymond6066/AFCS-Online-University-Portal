"use client";

import { useEffect, useState } from "react";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Announcement } from "../../../../lib/schema";
import { listAnnouncementsForAudience } from "../../../../services/data";

export default function StudentAnnouncementsPage() {
  const auth = useCurrentUserProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listAnnouncementsForAudience(["ALL", "STUDENT"]);
        setAnnouncements(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load announcements.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (auth.loading || loading) {
    return <LoadingState label="Loading announcements..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="section-title">Announcements</h2>
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{announcement.title}</h3>
              <span className="text-xs uppercase tracking-widest text-primary-500">{announcement.audience}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{announcement.body}</p>
            {announcement.createdAt && (
              <p className="text-xs text-slate-400">
                Posted {new Date(announcement.createdAt).toLocaleString()}
              </p>
            )}
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-sm text-slate-500">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
