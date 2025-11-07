"use client";

import { useToken } from "@/components/auth/token-context";

export const TokenIndicator = () => {
  const { token, setToken } = useToken();

  if (!token) {
    return (
      <span className="text-sm text-slate-500">토큰이 설정되지 않았습니다.</span>
    );
  }

  const short = `${token.slice(0, 2)}•••${token.slice(-4)}`;
  return (
    <div className="flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50/70 px-4 py-1.5 text-sm text-emerald-900">
      <span className="font-medium">토큰 활성화</span>
      <span className="font-mono text-xs text-emerald-700">{short}</span>
      <button
        type="button"
        className="text-xs text-emerald-900 underline underline-offset-4"
        onClick={() => setToken(null)}
      >
        제거
      </button>
    </div>
  );
};
