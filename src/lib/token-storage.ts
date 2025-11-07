"use client";

import { TOKEN_STORAGE_KEY } from "@/lib/config";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const storeToken = (value: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!value) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
};
