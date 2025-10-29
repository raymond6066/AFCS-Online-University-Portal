"use client";

import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { StatCard } from "@/components/cards/StatCard";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  code: string;
  enrollmentCount: number;
};

type Announcement = {
  id: string;
  title: string;
  createdAt?: string;
  audience: string;
};

export default function InstructorOverviewPage() {
  const { user } = useAuthContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data: courseData } = await client.models.Course.list({
          filter: { instructorId: { eq: user.id } },
        });

        const formattedCourses: Course[] = await Promise.all(
          (courseData ?? []).map(async (course) => {
            const { data: enrollments } = await client.models.Enrollment.list({
              filter: { courseId: { eq: course.id } },
            });
            return {
              id: course.id,
              title: course.title,
              code: course.code,
              enrollmentCount: enrollments?.length ?? 0,
            };
          })
        );

        const { data: assignmentData } = await client.models.Assignment.list({
          filter: { postedBySub: { eq: user.cognitoSub } },
        });

        const { data: attendanceData } = await client.models.Attendance.list({
          filter: { markedBySub: { eq: user.cognitoSub } },
        });

        const { data: announcementData } = await client.models.Announcement.list({
          filter: { createdBySub: { eq: user.cognitoSub } },
        });

        setCourses(formattedCourses);
        setAssignmentCount(assignmentData?.length ?? 0);
        setAttendanceCount(attendanceData?.length ?? 0);
        setAnnouncements((announcementData ?? []).slice(0, 5) as Announcement[]);
      } catch (err) {
        console.error(err);
        setError("Unable to load instructor dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user]);

  return (
    <RoleDashboard role="INSTRUCTOR" title="Instructor overview">
      {loading && <LoadingState message="Loading your teaching analytics..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <div className="space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard title="Courses" value={courses.length} subtitle="Active sections" />
            <StatCard title="Assignments posted" value={assignmentCount} />
            <StatCard title="Attendance events" value={attendanceCount} />
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Course roster</h2>
            <SimpleTable
              columns={[
                { header: "Course", accessor: (item: Course) => item.title },
                { header: "Code", accessor: (item: Course) => item.code },
                { header: "Enrolled", accessor: (item: Course) => item.enrollmentCount },
              ]}
              data={courses}
              emptyMessage="No assigned courses yet."
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{announcement.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">
                    {announcement.createdAt && new Date(announcement.createdAt).toLocaleString()} • Audience: {announcement.audience}
                  </p>
                </article>
              ))}
              {announcements.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  You haven&apos;t created any announcements yet.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </RoleDashboard>
  );
}
