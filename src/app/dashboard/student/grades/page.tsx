"use client";

import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Assignment, Grade } from "../../../../lib/schema";
import { listAssignmentsForCourses, listGradesForStudent, listStudentCourses } from "../../../../services/data";

export default function StudentGradesPage() {
  const auth = useCurrentUserProfile();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const [gradeData, courses] = await Promise.all([
          listGradesForStudent(auth.profile!.id),
          listStudentCourses(auth.profile!.id),
        ]);
        setGrades(gradeData);
        const assignmentData = await listAssignmentsForCourses(courses.map((course) => course.id));
        setAssignments(assignmentData);
      } catch (err) {
        console.error(err);
        setError("Unable to load grades.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading gradebook..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const assignmentMap = new Map(assignments.map((assignment) => [assignment.id, assignment.title]));

  return (
    <div className="space-y-4">
      <h2 className="section-title">Grades</h2>
      <DataTable
        data={grades}
        columns={[
          { header: "Assignment", accessor: (grade) => assignmentMap.get(grade.assignmentId) ?? "" },
          { header: "Score", accessor: (grade) => grade.score },
          { header: "Feedback", accessor: (grade) => grade.feedback ?? "--" },
        ]}
      />
    </div>
  );
}
