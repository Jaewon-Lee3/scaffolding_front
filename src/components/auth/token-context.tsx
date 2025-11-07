"use client";

import { TOKEN_HEADER } from "@/lib/config";
import { getStoredToken, storeToken } from "@/lib/token-storage";
import { createContext, useContext, useEffect, useState } from "react";

interface TokenContextValue {
  token: string | null;
  setToken: (value: string | null) => void;
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getStoredToken());
  }, []);

  const setToken = (value: string | null) => {
    storeToken(value);
    setTokenState(value);
  };

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const ctx = useContext(TokenContext);
  if (!ctx) {
    throw new Error("useToken must be used within TokenProvider");
  }
  return ctx;
};

export const TOKEN_HEADER_LABEL = TOKEN_HEADER;
