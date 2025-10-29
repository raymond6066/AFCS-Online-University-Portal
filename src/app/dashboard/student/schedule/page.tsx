"use client";

import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Course, Schedule } from "../../../../lib/schema";
import { listScheduleForStudent, listStudentCourses } from "../../../../services/data";

export default function StudentSchedulePage() {
  const auth = useCurrentUserProfile();
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const scheduleData = await listScheduleForStudent(auth.profile!.id);
        const courseData = await listStudentCourses(auth.profile!.id);
        setSchedule(scheduleData);
        setCourses(courseData);
      } catch (err) {
        console.error(err);
        setError("Unable to load schedule.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading schedule..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const courseMap = new Map(courses.map((course) => [course.id, course.title]));

  return (
    <div className="space-y-4">
      <h2 className="section-title">Weekly Schedule</h2>
      <DataTable
        data={schedule}
        columns={[
          { header: "Day", accessor: (item) => item.dayOfWeek },
          { header: "Time", accessor: (item) => item.timeRange },
          { header: "Course", accessor: (item) => (item.courseId ? courseMap.get(item.courseId) ?? "" : "Independent") },
        ]}
      />
    </div>
  );
}
