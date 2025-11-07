"use client";

import { TokenForm } from "@/components/auth/token-form";
import { useToken } from "@/components/auth/token-context";
import { ReactNode } from "react";

export const TokenGate = ({ children }: { children: ReactNode }) => {
  const { token } = useToken();

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <TokenForm />
      </div>
    );
  }

  return <>{children}</>;
};
