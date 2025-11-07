"use client";

import { TOKEN_HEADER_LABEL } from "@/components/auth/token-context";
import { useToken } from "@/components/auth/token-context";
import { useState } from "react";

export const TokenForm = () => {
  const { setToken } = useToken();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      setError("토큰을 입력해주세요.");
      return;
    }
    setError(null);
    setToken(value.trim());
  };

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">접근 토큰 입력</h2>
      <p className="mt-2 text-sm text-slate-600">
        관리자 또는 선생님 토큰을 입력하면 API 요청 시{" "}
        <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
          {TOKEN_HEADER_LABEL}
        </code>{" "}
        헤더로 자동 전송됩니다.
      </p>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <input
          type="password"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          placeholder="예: admin-test-token"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          토큰 저장
        </button>
      </form>
    </div>
  );
};
