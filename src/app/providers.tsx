"use client";

import { AuthProvider } from "@/context/AuthContext";
import { configureAmplify } from "@/lib/amplifyConfig";
import { ThemeProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";

export const Providers = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    configureAmplify();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
};
