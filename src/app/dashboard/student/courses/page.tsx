"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type CourseRecord = {
  id: string;
  title: string;
  code: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  instructorName?: string | null;
};

export default function StudentCoursesPage() {
  const { user } = useAuthContext();
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data: enrollmentData } = await client.models.Enrollment.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const courseIds = (enrollmentData ?? []).map((enrollment) => enrollment.courseId);

        const courseResults = await Promise.all(
          courseIds.map(async (courseId) => {
            const result = await client.models.Course.get({ id: courseId });
            return result.data ?? null;
          })
        );

        const formattedCourses: CourseRecord[] = courseResults
          .filter(Boolean)
          .map((course: any) => ({
            id: course.id,
            title: course.title,
            code: course.code,
            description: course.description,
            startDate: course.startDate,
            endDate: course.endDate,
            instructorName: (course.instructor as any)?.fullName ?? undefined,
          }));

        setCourses(formattedCourses);
      } catch (err) {
        console.error(err);
        setError("Unable to load enrolled courses.");
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, [user]);

  return (
    <RoleDashboard role="STUDENT" title="Enrolled courses">
      {loading && <LoadingState message="Fetching your courses..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <SimpleTable
          columns={[
            { header: "Course", accessor: (item: CourseRecord) => item.title },
            { header: "Code", accessor: (item: CourseRecord) => item.code },
            {
              header: "Instructor",
              accessor: (item: CourseRecord) => item.instructorName ?? "TBD",
            },
            {
              header: "Schedule",
              accessor: (item: CourseRecord) =>
                item.startDate && item.endDate
                  ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
                  : "--",
            },
          ]}
          data={courses}
          emptyMessage="No course enrollments found."
        />
      )}
    </RoleDashboard>
  );
}
