"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useCallback, useEffect, useMemo, useState } from "react";

type Course = { id: string; title: string };
type RosterMember = {
  studentId: string;
  studentSub: string;
  fullName?: string | null;
};

type AttendanceRecord = {
  id: string;
  studentId: string;
  status: string;
};

const attendanceStatuses = ["PRESENT", "ABSENT", "LATE"] as const;

type StatusValue = (typeof attendanceStatuses)[number];

export default function InstructorAttendancePage() {
  const { user } = useAuthContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [statuses, setStatuses] = useState<Record<string, StatusValue>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.Course.list({
        filter: { instructorId: { eq: user.id } },
      });
      const courseList = (data ?? []).map((course) => ({ id: course.id, title: course.title }));
      setCourses(courseList);
      if (courseList.length > 0) {
        setSelectedCourse((prev) => prev || courseList[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    const loadRosterAndAttendance = async () => {
      if (!selectedCourse) return;
      setLoading(true);
      setError(null);

      try {
        const { data: enrollmentData } = await client.models.Enrollment.list({
          filter: { courseId: { eq: selectedCourse } },
        });

        const rosterMembers: RosterMember[] = (enrollmentData ?? []).map((enrollment) => ({
          studentId: enrollment.studentId,
          studentSub: enrollment.studentSub,
          fullName: (enrollment.student as any)?.fullName ?? undefined,
        }));
        setRoster(rosterMembers);

        const { data: attendanceData } = await client.models.Attendance.list({
          filter: {
            and: [
              { courseId: { eq: selectedCourse } },
              { date: { eq: selectedDate } },
            ],
          },
        });

        const attendanceMap: Record<string, AttendanceRecord> = {};
        const statusMap: Record<string, StatusValue> = {};
        (attendanceData ?? []).forEach((record) => {
          attendanceMap[record.studentId] = {
            id: record.id,
            studentId: record.studentId,
            status: record.status as StatusValue,
          };
          statusMap[record.studentId] = record.status as StatusValue;
        });

        setAttendance(attendanceMap);
        setStatuses((prev) => ({ ...statusMap }));
      } catch (err) {
        console.error(err);
        setError("Unable to load roster or attendance.");
      } finally {
        setLoading(false);
      }
    };

    void loadRosterAndAttendance();
  }, [selectedCourse, selectedDate]);

  const handleStatusChange = (studentId: string, value: StatusValue) => {
    setStatuses((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleSave = async () => {
    if (!user || !selectedCourse) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await Promise.all(
        roster.map(async (member) => {
          const status = statuses[member.studentId] ?? "PRESENT";
          const existing = attendance[member.studentId];
          if (existing) {
            const result = await client.models.Attendance.update({
              id: existing.id,
              status,
            });
            if (result.errors && result.errors.length > 0) {
              throw new Error(result.errors[0].message);
            }
          } else {
            const result = await client.models.Attendance.create({
              courseId: selectedCourse,
              studentId: member.studentId,
              studentSub: member.studentSub,
              date: selectedDate,
              status,
              markedById: user.id,
              markedBySub: user.cognitoSub,
            });
            if (result.errors && result.errors.length > 0) {
              throw new Error(result.errors[0].message);
            }
          }
        })
      );

      setSuccess("Attendance saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    return roster.reduce(
      (acc, member) => {
        const status = statuses[member.studentId] ?? "PRESENT";
        acc[status] = (acc[status] ?? 0) + 1;
        return acc;
      },
      {} as Record<StatusValue, number>
    );
  }, [roster, statuses]);

  return (
    <RoleDashboard role="INSTRUCTOR" title="Attendance">
      {loading && <LoadingState message="Loading roster..." />}
      {error && !loading && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="space-y-6">
          {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">{success}</p>}
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Course</label>
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="rounded-3xl bg-slate-100/70 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
              <p>PRESENT: {summary.PRESENT ?? 0}</p>
              <p>LATE: {summary.LATE ?? 0}</p>
              <p>ABSENT: {summary.ABSENT ?? 0}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/70">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-800/70">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-200">Student</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {roster.map((member) => (
                  <tr key={member.studentId} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/60">
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{member.fullName ?? member.studentId}</td>
                    <td className="px-6 py-4">
                      <select
                        value={statuses[member.studentId] ?? "PRESENT"}
                        onChange={(event) => handleStatusChange(member.studentId, event.target.value as StatusValue)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {attendanceStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save attendance"}
          </button>
        </div>
      )}
    </RoleDashboard>
  );
}
