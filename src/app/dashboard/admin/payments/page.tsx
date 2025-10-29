"use client";

import { useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Payment, UserProfile } from "../../../../lib/schema";
import { client } from "../../../../lib/amplifyClient";
import { listPayments, listUserProfiles } from "../../../../services/data";

export default function AdminPaymentsPage() {
  const auth = useCurrentUserProfile();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [paymentData, userData] = await Promise.all([listPayments(), listUserProfiles()]);
        setPayments(paymentData);
        setStudents(userData.filter((user) => user.role === "STUDENT"));
      } catch (err) {
        console.error(err);
        setError("Unable to load payments.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (payment: Payment, status: Payment["status"]) => {
    try {
      const response = await client.models.Payment.update({ id: payment.id, status });
      if (response.data) {
        setPayments((prev) => prev.map((item) => (item.id === payment.id ? response.data! : item)));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update payment status.");
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading payments..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const studentMap = new Map(students.map((student) => [student.id, student.fullName ?? student.email]));

  return (
    <div className="space-y-4">
      <h2 className="section-title">Payments & Billing</h2>
      <DataTable
        data={payments}
        columns={[
          { header: "Student", accessor: (payment) => studentMap.get(payment.studentId) ?? payment.studentId },
          { header: "Amount", accessor: (payment) => `$${payment.amount.toFixed(2)}` },
          { header: "Status", accessor: (payment) => payment.status },
          { header: "Description", accessor: (payment) => payment.description ?? "--" },
          {
            header: "Actions",
            accessor: (payment) => (
              <div className="flex gap-2">
                <button className="text-primary-500" onClick={() => updateStatus(payment, "PAID")} type="button">
                  Mark Paid
                </button>
                <button className="text-amber-500" onClick={() => updateStatus(payment, "OVERDUE")} type="button">
                  Mark Overdue
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
