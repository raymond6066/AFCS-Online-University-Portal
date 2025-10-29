"use client";

import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Assignment, Course } from "../../../../lib/schema";
import { listAssignmentsForCourses, listStudentCourses } from "../../../../services/data";

export default function StudentAssignmentsPage() {
  const auth = useCurrentUserProfile();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const courseData = await listStudentCourses(auth.profile!.id);
        setCourses(courseData);
        const assignmentData = await listAssignmentsForCourses(courseData.map((course) => course.id));
        setAssignments(assignmentData);
      } catch (err) {
        console.error(err);
        setError("Unable to load assignments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading assignments..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const courseMap = new Map(courses.map((course) => [course.id, course.title]));

  return (
    <div className="space-y-4">
      <h2 className="section-title">Assignments</h2>
      <DataTable
        data={assignments}
        columns={[
          { header: "Title", accessor: (assignment) => assignment.title },
          { header: "Course", accessor: (assignment) => courseMap.get(assignment.courseId) ?? "" },
          { header: "Due", accessor: (assignment) => assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "TBD" },
        ]}
      />
    </div>
  );
}
