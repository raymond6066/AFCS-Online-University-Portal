"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { StatCard } from "@/components/cards/StatCard";
import { AdminAnalyticsChart } from "@/components/charts/AdminAnalyticsChart";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Announcement = {
  id: string;
  title: string;
  audience: string;
  createdAt?: string;
};

export default function AdminOverviewPage() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState(0);
  const [instructorCount, setInstructorCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [latePayments, setLatePayments] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const [{ data: users }, { data: courses }, { data: payments }, { data: attendance }, { data: announcementData }] =
          await Promise.all([
            client.models.UserProfile.list({}),
            client.models.Course.list({}),
            client.models.Payment.list({}),
            client.models.Attendance.list({}),
            client.models.Announcement.list({ limit: 10 }),
          ]);

        const roleCounts = (users ?? []).reduce(
          (acc, profile) => {
            acc[profile.role as keyof typeof acc] += 1;
            return acc;
          },
          { STUDENT: 0, INSTRUCTOR: 0, ADMIN: 0 }
        );

        setStudentCount(roleCounts.STUDENT);
        setInstructorCount(roleCounts.INSTRUCTOR);
        setAdminCount(roleCounts.ADMIN);
        setCoursesCount(courses?.length ?? 0);
        setLatePayments((payments ?? []).filter((payment) => payment.status === "OVERDUE").length);

        const attendanceRecords = attendance ?? [];
        if (attendanceRecords.length > 0) {
          const present = attendanceRecords.filter((record) => record.status === "PRESENT").length;
          setAttendanceRate(Math.round((present / attendanceRecords.length) * 100));
        } else {
          setAttendanceRate(0);
        }

        setAnnouncements((announcementData ?? []).slice(0, 5) as Announcement[]);
      } catch (err) {
        console.error(err);
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [user]);

  return (
    <RoleDashboard role="ADMIN" title="Analytics & reports">
      {loading && <LoadingState message="Loading analytics..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <div className="space-y-10">
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard title="Students" value={studentCount} />
            <StatCard title="Instructors" value={instructorCount} />
            <StatCard title="Admins" value={adminCount} />
            <StatCard title="Courses" value={coursesCount} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Financial health</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Late payments recorded this term.</p>
              <p className="mt-4 text-4xl font-bold text-slate-900 dark:text-white">{latePayments}</p>
            </div>
            <AdminAnalyticsChart attendanceRate={attendanceRate} latePayments={latePayments} coursesCount={coursesCount} />
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Latest announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{announcement.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">
                    Audience: {announcement.audience} • {announcement.createdAt && new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
              {announcements.length === 0 && (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  No announcements have been published yet.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </RoleDashboard>
  );
}
