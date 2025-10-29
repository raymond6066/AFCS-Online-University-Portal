"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Role, UserProfile } from "@/types";
import { useAmplifyUser } from "@/hooks/useAmplifyUser";

type AuthContextValue = {
  loading: boolean;
  user: UserProfile | null;
  role: Role | null;
  refresh: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const value = useAmplifyUser();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
