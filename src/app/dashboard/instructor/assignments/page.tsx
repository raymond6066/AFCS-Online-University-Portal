"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Assignment, Course } from "../../../../lib/schema";
import { client } from "../../../../lib/amplifyClient";
import { listInstructorCourses } from "../../../../services/data";
import { uploadFileToStorage } from "../../../../services/storage";

export default function InstructorAssignmentsPage() {
  const auth = useCurrentUserProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const courseData = await listInstructorCourses(auth.profile!.id);
        setCourses(courseData);
        const assignmentResults = await Promise.all(
          courseData.map((course) => client.models.Assignment.list({ filter: { courseId: { eq: course.id } } }))
        );
        setAssignments(assignmentResults.flatMap((result) => result.data));
      } catch (err) {
        console.error(err);
        setError("Unable to load assignments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth.profile) return;
    const formData = new FormData(event.currentTarget);
    const courseId = formData.get("courseId")?.toString() ?? "";
    const title = formData.get("title")?.toString() ?? "";
    const instructions = formData.get("instructions")?.toString() ?? "";
    const dueDate = formData.get("dueDate")?.toString() ?? undefined;
    const attachment = formData.get("attachment") as File | null;

    if (!courseId || !title) {
      setError("Course and title are required.");
      return;
    }

    try {
      setFormLoading(true);
      let attachmentUrl: string | undefined;
      if (attachment && attachment.size > 0) {
        attachmentUrl = await uploadFileToStorage(attachment, { prefix: "course-resources/" });
      }
      const response = await client.models.Assignment.create({
        courseId,
        title,
        instructions,
        dueDate,
        postedById: auth.profile.id,
        attachmentUrl,
      });
      if (response.data) {
        setAssignments((prev) => [response.data!, ...prev]);
      }
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Failed to create assignment.");
    } finally {
      setFormLoading(false);
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading assignments..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Post Assignment</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="courseId">Course</label>
            <select id="courseId" name="courseId" required>
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="instructions">Instructions</label>
            <textarea id="instructions" name="instructions" rows={4} />
          </div>
          <div>
            <label htmlFor="dueDate">Due date</label>
            <input id="dueDate" name="dueDate" type="datetime-local" />
          </div>
          <div>
            <label htmlFor="attachment">Attachment</label>
            <input id="attachment" name="attachment" type="file" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={formLoading} type="submit">
              {formLoading ? "Posting..." : "Post assignment"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="section-title">Recent Assignments</h3>
        <DataTable
          data={assignments}
          columns={[
            { header: "Title", accessor: (assignment) => assignment.title },
            {
              header: "Due",
              accessor: (assignment) =>
                assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "No due date",
            },
            {
              header: "Attachment",
              accessor: (assignment) =>
                assignment.attachmentUrl ? (
                  <a className="text-primary-500" href={assignment.attachmentUrl} target="_blank" rel="noreferrer">
                    Download
                  </a>
                ) : (
                  "--"
                ),
            },
          ]}
        />
      </div>
    </div>
  );
}
