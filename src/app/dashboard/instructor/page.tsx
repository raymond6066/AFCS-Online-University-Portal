"use client";

import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "../../../components/ui/InfoCard";
import { LoadingState, ErrorState } from "../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../hooks/useCurrentUserProfile";
import type { Assignment, Course, Grade } from "../../../lib/schema";
import { client } from "../../../lib/amplifyClient";
import { listInstructorCourses } from "../../../services/data";

export default function InstructorOverviewPage() {
  const auth = useCurrentUserProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const courseData = await listInstructorCourses(auth.profile!.id);
        setCourses(courseData);
        const assignmentsResults = await Promise.all(
          courseData.map((course) =>
            client.models.Assignment.list({ filter: { courseId: { eq: course.id } } })
          )
        );
        setAssignments(assignmentsResults.flatMap((result) => result.data));
        const gradesResults = await Promise.all(
          assignmentsResults.flatMap((result) =>
            result.data.map((assignment) =>
              client.models.Grade.list({ filter: { assignmentId: { eq: assignment.id } } })
            )
          )
        );
        setGrades(gradesResults.flatMap((result) => result.data));
      } catch (err) {
        console.error(err);
        setError("Failed to load instructor dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  const studentCount = useMemo(() => {
    const set = new Set<string>();
    grades.forEach((grade) => {
      if (grade.studentId) set.add(grade.studentId);
    });
    return set.size;
  }, [grades]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading instructor data..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <InfoCard title="Active Courses" subtitle="Teaching">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{courses.length}</p>
      </InfoCard>
      <InfoCard title="Assignments Posted" subtitle="Coursework">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{assignments.length}</p>
      </InfoCard>
      <InfoCard title="Students Graded" subtitle="Engagement">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{studentCount}</p>
      </InfoCard>
    </div>
  );
}
