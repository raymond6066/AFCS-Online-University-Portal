"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { uploadPrivateFile } from "@/lib/storage";
import { useCallback, useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
};

type Assignment = {
  id: string;
  title: string;
  courseId: string;
  dueDate?: string | null;
};

export default function InstructorAssignmentsPage() {
  const { user } = useAuthContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data: courseData } = await client.models.Course.list({
        filter: { instructorId: { eq: user.id } },
      });
      const courseRecords = (courseData ?? []).map((course) => ({ id: course.id, title: course.title }));
      setCourses(courseRecords);
      if (courseRecords.length > 0) {
        setCourseId((prev) => prev || courseRecords[0].id);
      }

      const { data: assignmentData } = await client.models.Assignment.list({
        filter: { postedBySub: { eq: user.cognitoSub } },
      });
      setAssignments((assignmentData ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        courseId: item.courseId,
        dueDate: item.dueDate,
      })));
    } catch (err) {
      console.error(err);
      setError("Unable to load assignment data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !courseId || !title) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let attachmentUrl: string | undefined;
      if (attachment) {
        attachmentUrl = await uploadPrivateFile(attachment, { folder: "assignments", access: "protected" });
      }

      const response = await client.models.Assignment.create({
        title,
        instructions: instructions || undefined,
        courseId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        postedById: user.id,
        postedBySub: user.cognitoSub,
        attachmentUrl,
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      setTitle("");
      setInstructions("");
      setDueDate("");
      setAttachment(null);
      setSuccess("Assignment posted successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError("Unable to create assignment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RoleDashboard role="INSTRUCTOR" title="Post assignment">
      {loading && <LoadingState message="Loading courses..." />}
      {error && !loading && <ErrorState message={error} onRetry={loadData} />}
      {!loading && !error && (
        <div className="space-y-8">
          <form onSubmit={handleCreate} className="space-y-6 rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Create assignment</h2>
            {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">{success}</p>}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Course</label>
                <select
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Due date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Instructions</label>
              <textarea
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Attachment (optional)</label>
              <input
                type="file"
                onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-sm text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
              disabled={submitting}
            >
              {submitting ? "Publishing..." : "Publish assignment"}
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">My assignments</h2>
            <SimpleTable
              columns={[
                { header: "Title", accessor: (item: Assignment) => item.title },
                { header: "Course", accessor: (item: Assignment) => item.courseId },
                {
                  header: "Due",
                  accessor: (item: Assignment) =>
                    item.dueDate ? new Date(item.dueDate).toLocaleString() : "--",
                },
              ]}
              data={assignments}
              emptyMessage="No assignments created yet."
            />
          </div>
        </div>
      )}
    </RoleDashboard>
  );
}
