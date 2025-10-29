"use client";

import { useEffect, useMemo, useState } from "react";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Attendance, Payment, UserProfile } from "../../../../lib/schema";
import { listPayments, listUserProfiles } from "../../../../services/data";
import { client } from "../../../../lib/amplifyClient";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function AdminAnalyticsPage() {
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
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat(undefined, { month: "short" });
    const grouped = new Map<string, { label: string; payments: number; attendance: number }>();

    payments.forEach((payment) => {
      if (!payment.timestamp) return;
      const date = new Date(payment.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const existing = grouped.get(key) ?? {
        label: `${monthFormatter.format(date)} ${date.getFullYear()}`,
        payments: 0,
        attendance: 0,
      };
      existing.payments += payment.amount;
      grouped.set(key, existing);
    });

    attendance.forEach((record) => {
      if (!record.date) return;
      const date = new Date(record.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const existing = grouped.get(key) ?? {
        label: `${monthFormatter.format(date)} ${date.getFullYear()}`,
        payments: 0,
        attendance: 0,
      };
      existing.attendance += record.status === "PRESENT" ? 1 : 0;
      grouped.set(key, existing);
    });

    return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [payments, attendance]);

  if (auth.loading || loading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const studentCount = users.filter((user) => user.role === "STUDENT").length;
  const instructorCount = users.filter((user) => user.role === "INSTRUCTOR").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Population</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {studentCount} students · {instructorCount} instructors
          </p>
        </div>
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Financials</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            ${payments.reduce((total, payment) => total + payment.amount, 0).toFixed(2)} received
          </p>
        </div>
      </div>
      <div className="card h-96">
        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Monthly payments vs. attendance
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="label" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Area type="monotone" dataKey="payments" stroke="#2563eb" fill="#2563eb22" name="Payments" />
            <Area type="monotone" dataKey="attendance" stroke="#10b981" fill="#10b98122" name="Attendance" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
