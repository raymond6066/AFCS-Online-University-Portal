import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AFCS Online University Portal",
  description:
    "Education resource management platform with student, instructor, and admin portals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className="h-full" lang="en">
      <body className={`${inter.className} min-h-full bg-gray-50 dark:bg-slate-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
