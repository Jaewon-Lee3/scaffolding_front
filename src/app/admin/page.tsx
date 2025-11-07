"use client";

import { useToken } from "@/components/auth/token-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Passage, RequestRecord } from "@/types/api";
import { useCallback, useEffect, useState } from "react";

export default function AdminPage() {
  const { token } = useToken();
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [ccLabels, setCcLabels] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const data = await apiFetch<RequestRecord[]>("/v1/requests", {
        token,
        searchParams: { status: "pending" },
      });
      setRequests(data);
      setRequestError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setRequestError(err.message);
      } else {
        setRequestError("요청 목록을 불러올 수 없습니다.");
      }
    } finally {
      setRequestsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePassageSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) {
      setSubmitMessage("지문 본문을 입력해주세요.");
      return;
    }
    setSubmitLoading(true);
    setSubmitMessage(null);
    try {
      await apiFetch<Passage>("/v1/passages", {
        method: "POST",
        token,
        body: {
          text: text.trim(),
          source: source.trim() || null,
          cc_labels: ccLabels
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });
      setSubmitMessage("지문이 등록되었습니다.");
      setText("");
      setSource("");
      setCcLabels("");
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitMessage(err.message);
      } else {
        setSubmitMessage("지문 등록 중 오류가 발생했습니다.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCompleteRequest = async (id: string) => {
    try {
      await apiFetch<RequestRecord>(`/v1/requests/${id}/complete`, {
        method: "PUT",
        token,
      });
      await fetchRequests();
    } catch (err) {
      if (err instanceof ApiError) {
        setRequestError(err.message);
      } else {
        setRequestError("요청 상태를 변경하지 못했습니다.");
      }
    }
  };

  return (
    <section className="space-y-10">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin
          </p>
          <h1 className="text-2xl font-bold text-slate-900">지문 등록</h1>
          <p className="text-sm text-slate-600">
            원본 지문과 메타데이터를 입력하면 DB에 바로 저장됩니다.
          </p>
        </header>
        <form className="mt-6 space-y-4" onSubmit={handlePassageSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">
              지문 본문
            </label>
            <textarea
              className="min-h-[200px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="원본 지문 전체를 입력하세요."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                출처
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="예: 2024 수능"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                CC 라벨 (쉼표로 구분)
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={ccLabels}
                onChange={(event) => setCcLabels(event.target.value)}
                placeholder="예: 3-1 중간고사, 수능 독서"
              />
            </div>
          </div>
          {submitMessage ? (
            <p className="text-sm text-slate-600">{submitMessage}</p>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={submitLoading}
          >
            {submitLoading ? "저장 중..." : "지문 저장"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              지문 요청 목록
            </h2>
            <p className="text-sm text-slate-500">
              대기 중인 요청을 우선순위 순으로 확인하세요.
            </p>
          </div>
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={fetchRequests}
          >
            새로고침
          </button>
        </header>

        {requestError ? (
          <p className="mt-4 text-sm text-red-600">{requestError}</p>
        ) : null}

        {requestsLoading ? (
          <p className="mt-4 text-sm text-slate-500">불러오는 중...</p>
        ) : requests.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            대기 중인 요청이 없습니다.
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-slate-100">
            {requests.map((request) => (
              <li key={request.id} className="py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs text-slate-500">
                      {request.source ?? "출처 미상"} · 요청 수{" "}
                      {request.request_count}회
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-slate-800">
                      {request.text.slice(0, 200)}
                      {request.text.length > 200 ? "…" : ""}
                    </p>
                    {request.cc_name ? (
                      <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        {request.cc_name}
                      </span>
                    ) : null}
                  </div>
                  <button
                    className="self-start rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                    onClick={() => handleCompleteRequest(request.id)}
                  >
                    처리 완료
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
