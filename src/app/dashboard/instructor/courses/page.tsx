"use client";

import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Course } from "../../../../lib/schema";
import { listInstructorCourses } from "../../../../services/data";

export default function InstructorCoursesPage() {
  const auth = useCurrentUserProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await listInstructorCourses(auth.profile!.id);
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load courses.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading courses..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="section-title">My Courses</h2>
      <DataTable
        data={courses}
        columns={[
          { header: "Title", accessor: (course) => course.title },
          { header: "Code", accessor: (course) => course.code },
          { header: "Start Date", accessor: (course) => course.startDate ?? "TBD" },
          { header: "End Date", accessor: (course) => course.endDate ?? "TBD" },
        ]}
      />
    </div>
  );
}
