"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AdminAnalyticsChartProps {
  attendanceRate: number;
  latePayments: number;
  coursesCount: number;
}

export const AdminAnalyticsChart = ({ attendanceRate, latePayments, coursesCount }: AdminAnalyticsChartProps) => {
  const series = useMemo(
    () => [attendanceRate, latePayments, coursesCount],
    [attendanceRate, latePayments, coursesCount]
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        foreColor: "#475569",
        toolbar: { show: false },
      },
      plotOptions: {
        radialBar: {
          hollow: { size: "45%" },
          dataLabels: {
            name: { fontSize: "14px" },
            value: { fontSize: "24px", formatter: (value: number) => `${Math.round(value)}%` },
          },
        },
      },
      labels: ["Attendance", "Late Payments", "Courses"],
      colors: ["#3C50E0", "#F59E0B", "#22AD5C"],
    }),
    []
  );

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur dark:bg-slate-900/70">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Key metrics</h3>
      <div className="mt-6">
        <ApexChart options={options} series={series} type="radialBar" height={320} />
      </div>
    </div>
  );
};
