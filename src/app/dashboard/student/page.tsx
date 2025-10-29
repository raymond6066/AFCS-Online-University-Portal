"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { StatCard } from "@/components/cards/StatCard";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Assignment = {
  id: string;
  title: string;
  dueDate?: string | null;
  courseId: string;
  courseTitle?: string;
};

type ScheduleItem = {
  id: string;
  dayOfWeek: string;
  timeRange: string;
  course?: { title?: string };
};

type Attendance = {
  id: string;
  status: string;
};

type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt?: string;
};

export default function StudentOverviewPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courseCount, setCourseCount] = useState(0);
  const [gradeAverage, setGradeAverage] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data: enrollmentData } = await client.models.Enrollment.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const courses = enrollmentData ?? [];
        setCourseCount(courses.length);

        const courseIds = courses.map((item) => item.courseId);

        const assignmentResults = await Promise.all(
          courseIds.map((courseId) =>
            client.models.Assignment.list({
              filter: { courseId: { eq: courseId } },
            })
          )
        );

        const assignmentCollection: Assignment[] = assignmentResults
          .flatMap(({ data }) => data ?? [])
          .map((item) => ({
            id: item.id,
            title: item.title,
            dueDate: item.dueDate,
            courseId: item.courseId,
            courseTitle: (item.course as any)?.title ?? undefined,
          }));

        const { data: attendanceData } = await client.models.Attendance.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const { data: scheduleData } = await client.models.Schedule.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const { data: gradeData } = await client.models.Grade.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const { data: announcementData } = await client.models.Announcement.list({
          filter: {
            or: [
              { audience: { eq: "ALL" } },
              { audience: { eq: "STUDENT" } },
            ],
          },
        });

        setAssignments(assignmentCollection);
        setAttendance(attendanceData ?? []);
        setSchedule(scheduleData ?? []);
        setAnnouncements((announcementData ?? []).slice(0, 5) as Announcement[]);

        if (gradeData && gradeData.length > 0) {
          const total = gradeData.reduce((sum, grade) => sum + (grade.score ?? 0), 0);
          setGradeAverage(total / gradeData.length);
        } else {
          setGradeAverage(null);
        }
      } catch (err) {
        console.error(err);
        setError("We ran into a problem loading your dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [user]);

  const attendanceRate = attendance.length
    ? Math.round(
        (attendance.filter((record) => record.status === "PRESENT").length / attendance.length) * 100
      )
    : 0;

  return (
    <RoleDashboard role="STUDENT" title="Student overview">
      {loading && <LoadingState message="Fetching your academic information..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}

      {!loading && !error && (
        <div className="space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard title="Active courses" value={courseCount} />
            <StatCard title="Upcoming assignments" value={assignments.length} subtitle="Within enrolled courses" />
            <StatCard
              title="Attendance rate"
              value={`${attendanceRate}%`}
              subtitle="Based on submitted attendance"
              trend={gradeAverage ? `Average grade: ${gradeAverage.toFixed(1)}` : undefined}
            />
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Upcoming assignments</h2>
            <SimpleTable
              columns={[
                { header: "Title", accessor: (item: Assignment) => item.title },
                { header: "Course", accessor: (item: Assignment) => item.courseTitle ?? item.courseId },
                {
                  header: "Due",
                  accessor: (item: Assignment) =>
                    item.dueDate ? new Date(item.dueDate).toLocaleString() : "TBD",
                },
              ]}
              data={assignments}
              emptyMessage="No assignments available yet."
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">This week&apos;s schedule</h2>
            <SimpleTable
              columns={[
                { header: "Day", accessor: (item: ScheduleItem) => item.dayOfWeek },
                { header: "Time", accessor: (item: ScheduleItem) => item.timeRange },
                {
                  header: "Course",
                  accessor: (item: ScheduleItem) => (item.course as any)?.title ?? "--",
                },
              ]}
              data={schedule as ScheduleItem[]}
              emptyMessage="No schedule items configured yet."
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Latest announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{announcement.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{announcement.body}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    Audience: {announcement.audience} • {announcement.createdAt && new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
              {announcements.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  No announcements available.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </RoleDashboard>
  );
}
