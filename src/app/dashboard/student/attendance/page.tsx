"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useMemo, useState } from "react";

type AttendanceRecord = {
  id: string;
  courseId: string;
  status: string;
  date: string;
  markedBy?: string | null;
};

export default function StudentAttendancePage() {
  const { user } = useAuthContext();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data } = await client.models.Attendance.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const attendanceRecords: AttendanceRecord[] = (data ?? []).map((item) => ({
          id: item.id,
          courseId: item.courseId,
          status: item.status,
          date: item.date,
          markedBy: (item.markedBy as any)?.fullName ?? undefined,
        }));

        setRecords(attendanceRecords);
      } catch (err) {
        console.error(err);
        setError("Unable to load attendance records.");
      } finally {
        setLoading(false);
      }
    };

    void loadAttendance();
  }, [user]);

  const summary = useMemo(() => {
    if (records.length === 0) return { present: 0, absent: 0, late: 0 };
    return records.reduce(
      (acc, record) => {
        if (record.status === "PRESENT") acc.present += 1;
        if (record.status === "ABSENT") acc.absent += 1;
        if (record.status === "LATE") acc.late += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
  }, [records]);

  const total = records.length;
  const presentRate = total ? Math.round((summary.present / total) * 100) : 0;

  return (
    <RoleDashboard role="STUDENT" title="Attendance">
      {loading && <LoadingState message="Loading attendance history..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-primary/10 p-6 text-center text-sm font-semibold text-primary">
              Present: {summary.present}
            </div>
            <div className="rounded-3xl bg-amber-500/10 p-6 text-center text-sm font-semibold text-amber-600">
              Late: {summary.late}
            </div>
            <div className="rounded-3xl bg-red-500/10 p-6 text-center text-sm font-semibold text-red-600">
              Absent: {summary.absent}
            </div>
          </div>
          <div className="rounded-3xl bg-emerald-500/10 p-6 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
            Attendance rate: {presentRate}%
          </div>
          <SimpleTable
            columns={[
              { header: "Date", accessor: (item: AttendanceRecord) => new Date(item.date).toLocaleDateString() },
              { header: "Course", accessor: (item: AttendanceRecord) => item.courseId },
              { header: "Status", accessor: (item: AttendanceRecord) => item.status },
              { header: "Marked by", accessor: (item: AttendanceRecord) => item.markedBy ?? "--" },
            ]}
            data={records}
            emptyMessage="No attendance has been recorded yet."
          />
        </div>
      )}
    </RoleDashboard>
  );
}
