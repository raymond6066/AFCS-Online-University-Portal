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
  startDate?: string | null;
  endDate?: string | null;
  enrollmentCount: number;
};

export default function InstructorCoursesPage() {
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
        const { data } = await client.models.Course.list({
          filter: { instructorId: { eq: user.id } },
        });

        const records: CourseRecord[] = await Promise.all(
          (data ?? []).map(async (course) => {
            const { data: enrollments } = await client.models.Enrollment.list({
              filter: { courseId: { eq: course.id } },
            });
            return {
              id: course.id,
              title: course.title,
              code: course.code,
              startDate: course.startDate,
              endDate: course.endDate,
              enrollmentCount: enrollments?.length ?? 0,
            };
          })
        );

        setCourses(records);
      } catch (err) {
        console.error(err);
        setError("Unable to load courses.");
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, [user]);

  return (
    <RoleDashboard role="INSTRUCTOR" title="My courses">
      {loading && <LoadingState message="Loading course details..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <SimpleTable
          columns={[
            { header: "Course", accessor: (item: CourseRecord) => item.title },
            { header: "Code", accessor: (item: CourseRecord) => item.code },
            {
              header: "Schedule",
              accessor: (item: CourseRecord) =>
                item.startDate && item.endDate
                  ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
                  : "--",
            },
            { header: "Enrolled", accessor: (item: CourseRecord) => item.enrollmentCount },
          ]}
          data={courses}
          emptyMessage="You have not been assigned to any courses yet."
        />
      )}
    </RoleDashboard>
  );
}
