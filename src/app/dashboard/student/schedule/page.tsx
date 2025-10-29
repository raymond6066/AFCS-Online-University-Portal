"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type ScheduleItem = {
  id: string;
  dayOfWeek: string;
  timeRange: string;
  courseTitle?: string | null;
};

export default function StudentSchedulePage() {
  const { user } = useAuthContext();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data } = await client.models.Schedule.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const scheduleItems: ScheduleItem[] = (data ?? []).map((item) => ({
          id: item.id,
          dayOfWeek: item.dayOfWeek,
          timeRange: item.timeRange,
          courseTitle: (item.course as any)?.title ?? item.courseId,
        }));

        setSchedule(scheduleItems);
      } catch (err) {
        console.error(err);
        setError("Unable to load schedule data.");
      } finally {
        setLoading(false);
      }
    };

    void loadSchedule();
  }, [user]);

  return (
    <RoleDashboard role="STUDENT" title="Schedule">
      {loading && <LoadingState message="Loading your schedule..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <SimpleTable
          columns={[
            { header: "Day", accessor: (item: ScheduleItem) => item.dayOfWeek },
            { header: "Time", accessor: (item: ScheduleItem) => item.timeRange },
            { header: "Course", accessor: (item: ScheduleItem) => item.courseTitle ?? "--" },
          ]}
          data={schedule}
          emptyMessage="No schedule configured."
        />
      )}
    </RoleDashboard>
  );
}
