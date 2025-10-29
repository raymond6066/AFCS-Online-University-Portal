"use client";

import { useEffect, useMemo, useState } from "react";
import { InfoCard } from "../../../components/ui/InfoCard";
import { LoadingState, ErrorState } from "../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../hooks/useCurrentUserProfile";
import type { Attendance, Payment, UserProfile } from "../../../lib/schema";
import { listPayments, listUserProfiles } from "../../../services/data";
import { client } from "../../../lib/amplifyClient";

export default function AdminOverviewPage() {
  const auth = useCurrentUserProfile();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userData, paymentData, attendanceData] = await Promise.all([
          listUserProfiles(),
          listPayments(),
          client.models.Attendance.list(),
        ]);
        setUsers(userData);
        setPayments(paymentData);
        setAttendance(attendanceData.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load admin overview.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const studentCount = useMemo(() => users.filter((user) => user.role === "STUDENT").length, [users]);
  const instructorCount = useMemo(() => users.filter((user) => user.role === "INSTRUCTOR").length, [users]);
  const overduePayments = useMemo(
    () => payments.filter((payment) => payment.status === "OVERDUE").length,
    [payments]
  );
  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter((record) => record.status === "PRESENT").length;
    return Math.round((presentCount / attendance.length) * 100);
  }, [attendance]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading admin analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <InfoCard title="Students" subtitle="Active profiles">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{studentCount}</p>
      </InfoCard>
      <InfoCard title="Instructors" subtitle="Active faculty">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{instructorCount}</p>
      </InfoCard>
      <InfoCard title="Overdue Payments" subtitle="Billing alerts">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{overduePayments}</p>
      </InfoCard>
      <InfoCard title="Attendance Rate" subtitle="All courses">
        <p className="text-3xl font-semibold text-primary-600 dark:text-primary-300">{attendanceRate}%</p>
      </InfoCard>
    </div>
  );
}
