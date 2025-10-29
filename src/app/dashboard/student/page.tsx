"use client";

import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "../../../components/ui/InfoCard";
import { LoadingState, ErrorState } from "../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../hooks/useCurrentUserProfile";
import type { Attendance, Course, Grade } from "../../../lib/schema";
import { listAttendanceForStudent, listGradesForStudent, listStudentCourses } from "../../../services/data";

export default function StudentOverviewPage() {
  const auth = useCurrentUserProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const [courseData, gradeData, attendanceData] = await Promise.all([
          listStudentCourses(auth.profile!.id),
          listGradesForStudent(auth.profile!.id),
          listAttendanceForStudent(auth.profile!.id),
        ]);
        setCourses(courseData);
        setGrades(gradeData);
        setAttendance(attendanceData);
      } catch (err) {
        console.error(err);
        setError("Failed to load student overview.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter((record) => record.status === "PRESENT").length;
    return Math.round((presentCount / attendance.length) * 100);
  }, [attendance]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading your overview..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <InfoCard title="Enrolled Courses" subtitle="Learning">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{courses.length}</p>
      </InfoCard>
      <InfoCard title="Assignments Graded" subtitle="Progress">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{grades.length}</p>
      </InfoCard>
      <InfoCard title="Attendance" subtitle="This term">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{attendanceRate}%</p>
      </InfoCard>
    </div>
  );
}
