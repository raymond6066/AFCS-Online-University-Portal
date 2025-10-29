"use client";

import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { uploadPrivateFile } from "@/lib/storage";
import type { Role } from "@/types";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const roles: Role[] = ["STUDENT", "INSTRUCTOR", "ADMIN"];

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, role, refresh, signIn } = useAuthContext();
  const [email, setEmail] = useState("");
  const [cognitoSub, setCognitoSub] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("STUDENT");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [rank, setRank] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminExists, setAdminExists] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      void signIn();
    }
  }, [loading, signIn, user]);

  useEffect(() => {
    if (!loading && role) {
      router.replace(`/dashboard/${role.toLowerCase()}`);
    }
  }, [loading, role, router]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const current = await getCurrentUser();
        setEmail(current.signInDetails?.loginId ?? "");
        setCognitoSub(current.userId);
      } catch (err) {
        console.error(err);
      }
    };
    void fetchUserInfo();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await client.models.UserProfile.list({
        filter: { role: { eq: "ADMIN" } },
        limit: 1,
      });
      if (data && data.length > 0) {
        setAdminExists(true);
        setSelectedRole("STUDENT");
      }
    };
    void checkAdmin();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      !!email &&
      !!fullName &&
      !!department &&
      !!passportFile &&
      !!medicalFile &&
      !submitting
    );
  }, [department, email, fullName, medicalFile, passportFile, submitting]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passportFile || !medicalFile || !cognitoSub) return;

    setSubmitting(true);
    setError(null);

    try {
      const passportKey = await uploadPrivateFile(passportFile, {
        folder: "passports",
        access: "protected",
      });
      const medicalKey = await uploadPrivateFile(medicalFile, {
        folder: "medical-records",
        access: "protected",
      });

      await client.models.UserProfile.create({
        cognitoSub,
        email,
        fullName,
        department,
        rank: rank || undefined,
        serviceNumber: serviceNumber || undefined,
        role: selectedRole,
        passportPhotoUrl: passportKey,
        medicalRecordUrl: medicalKey,
      });

      await refresh();
      router.replace(`/dashboard/${selectedRole.toLowerCase()}`);
    } catch (err) {
      console.error(err);
      setError("We were unable to create your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-3xl bg-white/80 p-10 shadow-xl shadow-slate-900/5 backdrop-blur dark:bg-slate-900/70">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Complete your profile</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Provide the required information so we can route you to the right experience.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              readOnly
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</label>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Department / Program</label>
              <input
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Rank</label>
              <input
                value={rank}
                onChange={(event) => setRank(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Service number</label>
              <input
                value={serviceNumber}
                onChange={(event) => setServiceNumber(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Role</label>
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as Role)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              disabled={adminExists}
            >
              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {adminExists && (
              <p className="mt-2 text-xs text-amber-500">
                An administrator already exists. Contact the admin team if you require elevated access.
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Passport photo (JPG/PNG)
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => setPassportFile(event.target.files?.[0] ?? null)}
                required
                className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-sm text-slate-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Medical record (PDF)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setMedicalFile(event.target.files?.[0] ?? null)}
                required
                className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-sm text-slate-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {error && <p className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
          >
            {submitting ? "Creating profile..." : "Create profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
