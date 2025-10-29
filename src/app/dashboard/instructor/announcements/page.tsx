"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useCallback, useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  audience: string;
  createdAt?: string;
};

const audiences = [
  { value: "ALL", label: "Everyone" },
  { value: "STUDENT", label: "Students" },
  { value: "INSTRUCTOR", label: "Instructors" },
];

export default function InstructorAnnouncementsPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.Announcement.list({
        filter: { createdBySub: { eq: user.cognitoSub } },
      });
      setAnnouncements((data ?? []) as Announcement[]);
    } catch (err) {
      console.error(err);
      setError("Unable to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await client.models.Announcement.create({
        title,
        body,
        audience: audience as any,
        createdById: user.id,
        createdBySub: user.cognitoSub,
        createdAt: new Date().toISOString(),
      });
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }
      setTitle("");
      setBody("");
      setAudience("ALL");
      setSuccess("Announcement published.");
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
      setError("Unable to publish announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleDashboard role="INSTRUCTOR" title="Announcements">
      {loading && <LoadingState message="Loading announcements..." />}
      {error && !loading && <ErrorState message={error} onRetry={loadAnnouncements} />}
      {!loading && !error && (
        <div className="space-y-8">
          <form onSubmit={handleCreate} className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Post announcement</h2>
            {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">{success}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Body</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={4}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Audience</label>
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {audiences.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish"}
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My announcements</h2>
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow dark:border-slate-800 dark:bg-slate-900/70"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{announcement.title}</h3>
                <p className="mt-2 text-xs text-slate-500">
                  Audience: {announcement.audience} • {announcement.createdAt && new Date(announcement.createdAt).toLocaleString()}
                </p>
              </article>
            ))}
            {announcements.length === 0 && (
              <p className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                No announcements yet.
              </p>
            )}
          </div>
        </div>
      )}
    </RoleDashboard>
  );
}
