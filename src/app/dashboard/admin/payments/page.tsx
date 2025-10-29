"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  status: string;
  description?: string | null;
  timestamp?: string;
  studentId: string;
  student?: { fullName?: string | null; email: string };
};

const statuses = ["PENDING", "PAID", "OVERDUE"] as const;

type Status = (typeof statuses)[number];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.Payment.list({});
      setPayments((data ?? []) as Payment[]);
    } catch (err) {
      console.error(err);
      setError("Unable to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const handleStatusChange = async (payment: Payment, status: Status) => {
    setSavingId(payment.id);
    setError(null);
    try {
      const result = await client.models.Payment.update({
        id: payment.id,
        status,
      });
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }
      await loadPayments();
    } catch (err) {
      console.error(err);
      setError("Unable to update payment status.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <RoleDashboard role="ADMIN" title="Payments">
      {loading && <LoadingState message="Loading payments..." />}
      {error && !loading && <ErrorState message={error} onRetry={loadPayments} />}
      {!loading && !error && (
        <SimpleTable
          columns={[
            {
              header: "Student",
              accessor: (item: Payment) => item.student?.fullName ?? item.student?.email ?? item.studentId,
            },
            { header: "Amount", accessor: (item: Payment) => `$${item.amount.toFixed(2)}` },
            {
              header: "Status",
              accessor: (item: Payment) => (
                <select
                  value={item.status}
                  onChange={(event) => void handleStatusChange(item, event.target.value as Status)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  disabled={savingId === item.id}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ),
            },
            {
              header: "Description",
              accessor: (item: Payment) => item.description ?? "--",
            },
            {
              header: "Recorded",
              accessor: (item: Payment) => (item.timestamp ? new Date(item.timestamp).toLocaleString() : "--"),
            },
          ]}
          data={payments}
          emptyMessage="No payments recorded."
        />
      )}
    </RoleDashboard>
  );
}
