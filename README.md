# AFCS Online University ERP

A full-stack education resource management portal built with **Next.js 15 (React 19 + TypeScript)**, **Tailwind CSS**, and **AWS Amplify Gen 2**. The platform delivers secure, role-based experiences for students, instructors, and administrators, including course management, assignments, attendance tracking, grading, document storage, analytics, and more.

## ✨ Key Capabilities

- **Amplify Auth (Cognito Hosted UI)** for secure email-based sign-up/sign-in and MFA support.
- **Amplify Data (GraphQL)** models for user profiles, courses, assignments, grades, attendance, schedules, announcements, resource bookings, and payments with granular `@auth` rules.
- **Amplify Storage (S3)** integration for protected uploads such as passports, medical records, and assignment attachments.
- **Role-specific dashboards** with modern UI components, tables, and charts:
  - Student portal for courses, assignments, grades, schedules, attendance, announcements, messages, and profile management.
  - Instructor workspace for posting assignments, marking attendance, managing grades, creating announcements, and course oversight.
  - Admin console for analytics, user administration with secure document access, payment tracking, resource booking approvals, and campus-wide announcements.
- **Dark mode** support via `next-themes` and Tailwind’s `dark` classes.
- Responsive layout with collapsible navigation, stat cards, tables, and chart visualizations.

## 🧱 Project Structure

```
amplify/
  auth/
  data/
    schema.graphql         # Amplify GraphQL data models with @auth rules
    resource.ts            # Gen 2 data definition + client schema export
  storage/
  backend.ts               # Amplify backend entrypoint
src/
  app/
    dashboard/             # Student, instructor, admin routes & pages
    signup/                # Post-auth onboarding + document upload
    layout.tsx             # Root layout with providers
    providers.tsx          # Theme + Amplify + Auth contexts
    globals.css            # Tailwind base styles
  components/              # Layout, tables, cards, charts, feedback UI
  context/AuthContext.tsx  # Auth-aware React context
  hooks/                   # Amplify auth + role guard hooks
  lib/                     # Amplify client/config and storage helpers
  types/                   # Shared TypeScript types
  utils/                   # Navigation link definitions
amplify_outputs.json       # Placeholder for Amplify environment outputs
```

## 🚀 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Visit `http://localhost:3000` to access the landing page. Sign in via the Cognito Hosted UI, complete your profile (upload passport and medical record), and you’ll be routed to the appropriate dashboard.

> **Note:** The repo includes placeholder values inside `amplify_outputs.json`. After provisioning the backend (see below), Amplify will generate real configuration values that must replace these placeholders locally and in your deployment pipeline.

## 🛠️ Amplify Backend (Gen 2) Overview

The GraphQL schema (`amplify/data/schema.graphql`) defines:

- `UserProfile` with role-based access control and protected fields (`medicalRecordUrl`, `passportPhotoUrl`).
- Academic entities such as `Course`, `Assignment`, `Grade`, `Attendance`, `Schedule`, and `Enrollment` to establish student-course relationships.
- Administrative models including `Announcement`, `ResourceBooking`, and `Payment` with nuanced auth rules (e.g., students can only read their own records, instructors manage their cohorts, admins retain global control).
- Storage resources enforce protected access with admin-readable medical documents.

Frontend data access leverages the Amplify Data client:

```ts
import { client } from "@/lib/amplifyClient";

const { data } = await client.models.Course.list({
  filter: { instructorId: { eq: user.id } },
});
```

File uploads use the modern Storage v2 API:

```ts
import { uploadPrivateFile } from "@/lib/storage";

const key = await uploadPrivateFile(file, {
  folder: "passports",
  access: "protected",
});
```

Auth flows rely on Hosted UI redirects via `signInWithRedirect({ provider: "COGNITO" })`, and sessions are read through Amplify’s `getCurrentUser` + `fetchAuthSession` helpers.

## ☁️ Deployment Guide (AWS Amplify Hosting)

1. **Initialize Amplify Gen 2 backend**
   ```bash
   npm install -g @aws-amplify/cli
   amplify sandbox --config amplify/backend.ts
   ```
   Follow the prompts to provision Auth (Hosted UI), Data, and Storage resources. Update the OAuth domain/redirects in `amplify/auth/resource.ts` as needed.

2. **Pull backend outputs locally**
   ```bash
   amplify pull
   ```
   This command generates a new `amplify_outputs.json`. Replace the placeholder file in the repo with the generated version so the React app can connect to the correct Amplify environment.

3. **Configure Cognito Hosted UI**
   - In the Amplify Console, open the Auth resource.
   - Set the domain prefix, callback URLs (`http://localhost:3000/`, production URL), and sign-out URLs.
   - Add any OAuth providers if required.

4. **Run locally with real backend**
   ```bash
   npm run dev
   ```
   Verify sign-in via Hosted UI, profile completion, file uploads, and dashboard CRUD flows.

5. **Deploy to Amplify Hosting**
   - Connect your Git repository in the Amplify Console.
   - Configure build settings (e.g., `npm ci`, `npm run build`, `npm run start` for SSR).
   - Provide environment variables if needed (e.g., overriding redirect URLs for production) and ensure the generated `amplify_outputs.json` is committed or injected as part of the build.
   - Amplify automatically builds the Next.js app and serves it globally.

6. **Post-deployment checks**
   - Confirm Hosted UI redirect URLs include your production domain.
   - Validate protected document access for admins only.
   - Verify analytics/stat cards render correctly with live data.

## ✅ Testing Checklist

- Student flow: enrollment data, assignment listings, grade visibility, attendance summaries, schedule display, and announcement feeds.
- Instructor flow: assignment creation (with optional attachments), attendance marking, gradebook updates, and instructor-specific announcements.
- Admin flow: user management (including secure document previews), payment status updates, resource booking approvals, analytics chart rendering, and global announcements.
- Dark mode toggle, responsive layouts, and role-based route protection.

## 📄 License

This project customizes the original template to deliver a production-ready AFCS Online University ERP experience. Review original licensing terms if you plan to redistribute template assets.
