# AFCS Online University Portal

A full-stack education resource management platform built with Next.js 15 (React 19), TypeScript, Tailwind CSS, and AWS Amplify Gen 2. The application delivers role-based dashboards for students, instructors, and administrators with secure Cognito Hosted UI authentication, Amplify Data models, and S3-backed storage for sensitive documents.

## Features

- 🔐 **AWS Cognito Hosted UI** sign-in/sign-up with profile completion workflow.
- 👥 **UserProfile** model persisted in Amplify Data with role-aware access rules.
- 🎓 **Student dashboard** for courses, assignments, grades, attendance summaries, schedules, announcements, messages, and profile management.
- 🧑‍🏫 **Instructor dashboard** for course management, assignment publishing with file uploads, attendance, gradebook, announcements, and communication planning.
- 🛡️ **Admin dashboard** for user management, payments, resource booking approvals, analytics, announcements, and secure document review.
- ☁️ **Amplify Storage v2** integrations for passport photo and medical record uploads with S3 access controls.
- 🌙 **Dark mode** powered by `next-themes` and Tailwind’s `dark` variant.
- 📊 **Analytics** page with Recharts visualizing payments versus attendance over time.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+ (or yarn/pnpm)
- AWS account with Amplify Gen 2 access enabled

### Install dependencies

```bash
npm install
```

> ℹ️ If your environment blocks scoped npm packages you may see a `403` error. Ensure outbound access to `@aws-amplify/*` packages or install from a network that can reach the public npm registry.

### Run the dev server

```bash
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000).

## Amplify Backend Structure

```
amplify/
├── backend.ts           # Registers auth, data, and storage resources
├── schema.graphql       # GraphQL models with @auth rules
├── auth/
│   ├── resource.ts      # Cognito Hosted UI configuration + custom role attribute
│   └── triggers/
│       └── post-confirmation.ts
├── data/
│   └── resource.ts      # Amplify Data resource definition
└── storage/
    └── resource.ts      # S3 buckets for passport photos, medical records, course files
```

## Deployment Guide (Amplify Gen 2 + Amplify Hosting)

1. **Initialize Amplify project**
   ```bash
   npm create amplify@latest
   # or, from this repo root
   npx amplify sandbox --config-file amplify/backend.ts
   ```

2. **Provision backend resources**
   ```bash
   npx amplify sandbox
   ```
   - Accept the proposed stack.
   - Amplify will create the Cognito user pool, AppSync API, and S3 bucket using `amplify/backend.ts` and `amplify/schema.graphql`.

3. **Configure Hosted UI**
   - In the Amplify console (or Cognito console) set the domain prefix, callback URLs, and sign-out URLs to match your deployment and local environments.
   - Update `amplify/auth/resource.ts` and `amplify_outputs.json` (or the generated `amplify_outputs.json`) with the correct domain and redirect URIs.

4. **Pull generated outputs**
   ```bash
   npx amplify pull
   ```
   - This writes an environment-specific `amplify_outputs.json`. Commit the environment-safe defaults and use `.gitignore`/environment variables for secrets if required.

5. **Connect the frontend**
   - Ensure `src/app/providers.tsx` imports the generated `amplify_outputs.json`.
   - Update the OAuth redirect URIs to include the Amplify Hosting domain once deployed.

6. **Run locally**
   ```bash
   npm run dev
   ```
   - Use the `/login` route to redirect to the Cognito Hosted UI.
   - Complete the `/signup` onboarding form on first sign-in.

7. **Deploy to Amplify Hosting**
   - From the Amplify console choose **Host web app**.
   - Connect the repository/branch containing this project.
   - Set build commands:
     ```bash
     npm install
     npm run build
     ```
   - Amplify Hosting will inject the environment-specific `amplify_outputs.json` at build time. Ensure the file is committed or provided via environment variables.

8. **Post-deployment**
   - Update the Cognito Hosted UI redirect URLs to include the production domain.
   - Seed initial admin accounts by signing in and choosing the `ADMIN` role when no profiles exist.

## Scripts

- `npm run dev` – start the Next.js dev server
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – run Next.js lint rules

## Environment Variables

The app expects the generated `amplify_outputs.json` to be present at the repository root. Amplify generates and maintains this file when you run `amplify pull` or deploy from Amplify Hosting. No manual `.env` variables are required beyond the outputs.

## License

MIT
