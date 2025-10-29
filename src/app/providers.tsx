"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { ThemeProvider } from "next-themes";
import { PropsWithChildren, useEffect, useRef } from "react";

const configureAmplify = () => {
  Amplify.configure(outputs, { ssr: true });
};

export default function Providers({ children }: PropsWithChildren) {
  const configured = useRef(false);

  useEffect(() => {
    if (!configured.current) {
      configureAmplify();
      configured.current = true;
    }
  }, []);

  return (
    <ThemeProvider attribute="class" enableSystem defaultTheme="light">
      {children}
    </ThemeProvider>
  );
}
