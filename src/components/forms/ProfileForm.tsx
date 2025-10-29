"use client";

import { FormEvent, useState } from "react";
import { client } from "../../lib/amplifyClient";
import type { UserProfile, UserRole } from "../../lib/schema";
import { DASHBOARD_ROUTE } from "../../lib/roles";
import { uploadFileToStorage } from "../../services/storage";
import { useRouter } from "next/navigation";

export type ProfileFormProps = {
  cognitoSub: string;
  email: string;
  existingProfile?: UserProfile | null;
  availableRoles: UserRole[];
};

export function ProfileForm({ cognitoSub, email, existingProfile, availableRoles }: ProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(existingProfile?.fullName ?? "");
  const [department, setDepartment] = useState(existingProfile?.department ?? "");
  const [rank, setRank] = useState(existingProfile?.rank ?? "");
  const [serviceNumber, setServiceNumber] = useState(existingProfile?.serviceNumber ?? "");
  const [role, setRole] = useState<UserRole>(existingProfile?.role ?? availableRoles[0]);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let passportPhotoUrl = existingProfile?.passportPhotoUrl ?? null;
      if (passportFile) {
        passportPhotoUrl = await uploadFileToStorage(passportFile, {
          prefix: "passport-photos/",
        });
      }

      let medicalRecordUrl = existingProfile?.medicalRecordUrl ?? null;
      if (medicalFile) {
        medicalRecordUrl = await uploadFileToStorage(medicalFile, {
          prefix: "medical-records/",
        });
      }

      if (existingProfile) {
        await client.models.UserProfile.update({
          id: existingProfile.id,
          fullName,
          department,
          rank,
          serviceNumber,
          role,
          passportPhotoUrl: passportPhotoUrl ?? undefined,
          medicalRecordUrl: medicalRecordUrl ?? undefined,
        });
      } else {
        await client.models.UserProfile.create({
          cognitoSub,
          email,
          fullName,
          department,
          rank,
          serviceNumber,
          role,
          passportPhotoUrl: passportPhotoUrl ?? undefined,
          medicalRecordUrl: medicalRecordUrl ?? undefined,
        });
      }

      router.replace(DASHBOARD_ROUTE[role]);
    } catch (submissionError) {
      console.error(submissionError);
      setError("Unable to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Complete your profile</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Provide your information so we can tailor your dashboard experience.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="department">Program / Department</label>
          <input
            id="department"
            name="department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="rank">Rank (optional)</label>
          <input id="rank" name="rank" value={rank} onChange={(event) => setRank(event.target.value)} />
        </div>
        <div>
          <label htmlFor="serviceNumber">Service Number (optional)</label>
          <input
            id="serviceNumber"
            name="serviceNumber"
            value={serviceNumber}
            onChange={(event) => setServiceNumber(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
            {availableRoles.map((availableRole) => (
              <option key={availableRole} value={availableRole}>
                {availableRole}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="passport">Passport photo (JPG/PNG)</label>
          <input id="passport" name="passport" type="file" accept="image/*" onChange={(event) => setPassportFile(event.target.files?.[0] ?? null)} />
          {existingProfile?.passportPhotoUrl && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Existing file: {existingProfile.passportPhotoUrl}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="medical">Medical record (PDF)</label>
          <input id="medical" name="medical" type="file" accept="application/pdf" onChange={(event) => setMedicalFile(event.target.files?.[0] ?? null)} />
          {existingProfile?.medicalRecordUrl && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Existing file: {existingProfile.medicalRecordUrl}
            </p>
          )}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end">
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
