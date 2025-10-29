"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Announcement } from "../../../../lib/schema";
import { client } from "../../../../lib/amplifyClient";
import { listAnnouncements } from "../../../../services/data";

export default function AdminAnnouncementsPage() {
  const auth = useCurrentUserProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await listAnnouncements();
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth.profile) return;
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title")?.toString() ?? "";
    const body = formData.get("body")?.toString() ?? "";
    const audience = formData.get("audience")?.toString() ?? "ALL";

    if (!title || !body) {
      setError("Title and body are required.");
      return;
    }

    try {
      setFormLoading(true);
      const response = await client.models.Announcement.create({
        title,
        body,
        audience: audience as Announcement["audience"],
        createdById: auth.profile.id,
      });
      if (response.data) {
        setAnnouncements((prev) => [response.data!, ...prev]);
      }
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Failed to publish announcement.");
    } finally {
      setFormLoading(false);
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading announcements..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Broadcast Announcement</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>
          <div>
            <label htmlFor="audience">Audience</label>
            <select id="audience" name="audience">
              <option value="ALL">All users</option>
              <option value="STUDENT">Students</option>
              <option value="INSTRUCTOR">Instructors</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
          <div>
            <label htmlFor="body">Message</label>
            <textarea id="body" name="body" rows={4} required />
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" disabled={formLoading} type="submit">
              {formLoading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="section-title">Recent Announcements</h3>
        {announcements.map((announcement) => (
          <div key={announcement.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{announcement.title}</h4>
              <span className="text-xs uppercase tracking-widest text-primary-500">{announcement.audience}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{announcement.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
