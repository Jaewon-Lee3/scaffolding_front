"use client";

import { useToken } from "@/components/auth/token-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { RequestRecord, SearchResult } from "@/types/api";
import Link from "next/link";
import { useMemo, useState } from "react";

type SearchType = "text" | "cc" | "source";

const searchTypeOptions: { label: string; value: SearchType }[] = [
  { label: "지문 텍스트", value: "text" },
  { label: "CC 이름", value: "cc" },
  { label: "출처", value: "source" },
];

export default function SearchPage() {
  const { token } = useToken();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("text");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [requestText, setRequestText] = useState("");
  const [requestSource, setRequestSource] = useState("");
  const [requestCc, setRequestCc] = useState("");
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const hasResults = results.length > 0;

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) {
      setError("검색어를 입력하세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<SearchResult[]>("/v1/search", {
        searchParams: { q: query.trim(), type: searchType },
        token,
      });
      setResults(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("검색 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!requestText.trim()) {
      setRequestStatus("error");
      setRequestMessage("요청 지문을 입력해주세요.");
      return;
    }
    setRequestStatus("loading");
    setRequestMessage(null);
    try {
      const payload = {
        text: requestText.trim(),
        source: requestSource.trim() || null,
        cc_name: requestCc.trim() || null,
        requester_id: crypto.randomUUID(),
      };
      await apiFetch<RequestRecord>("/v1/requests", {
        method: "POST",
        body: payload,
        token,
      });
      setRequestStatus("success");
      setRequestMessage("요청이 접수되었습니다.");
      setRequestText("");
      setRequestSource("");
      setRequestCc("");
    } catch (err) {
      setRequestStatus("error");
      if (err instanceof ApiError) {
        setRequestMessage(err.message);
      } else {
        setRequestMessage("요청 처리 중 오류가 발생했습니다.");
      }
    }
  };

  const requestStatusLabel = useMemo(() => {
    if (requestStatus === "loading") return "요청 중...";
    if (requestStatus === "success") return "요청 완료";
    return "요청 제출";
  }, [requestStatus]);

  return (
    <section className="space-y-10">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-emerald-700">검색</p>
          <h1 className="text-2xl font-bold text-slate-900">
            지문과 참고자료를 빠르게 찾아보세요
          </h1>
          <p className="text-sm text-slate-600">
            CC 이름, 지문 일부, 출처 키워드 중 원하는 방식으로 검색할 수
            있습니다.
          </p>
        </header>

        <form onSubmit={handleSearch} className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                검색어
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="예: 칼의 노래, 3학년 1학기 모의고사"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="w-full space-y-2 md:w-44">
              <label className="text-xs font-semibold text-slate-600">
                검색 기준
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                value={searchType}
                onChange={(event) =>
                  setSearchType(event.target.value as SearchType)
                }
              >
                {searchTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={loading}
          >
            {loading ? "검색 중..." : "검색 실행"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">검색 결과</h2>
            <p className="text-sm text-slate-500">
              {hasResults
                ? `${results.length}건이 검색되었습니다.`
                : "검색을 실행하면 결과가 표시됩니다."}
            </p>
          </div>
        </header>

        {hasResults ? (
          <ul className="divide-y divide-slate-100">
            {results.map((item) => (
              <li key={item.passage_id} className="py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {item.source ?? "출처 미상"}
                    </p>
                    <p className="text-base font-medium text-slate-900">
                      {item.preview}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.cc_labels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                      onClick={() => handleCopy(item.preview)}
                    >
                      미리보기 복사
                    </button>
                    <Link
                      href={`/passages/${item.passage_id}`}
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      상세 보기
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            검색 결과가 여기에 나타납니다.
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">
          신규 지문 요청
        </h2>
        <p className="text-sm text-slate-500">
          자료가 없을 경우 원본 지문을 그대로 붙여 넣어서 요청할 수 있습니다.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleRequestSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600">
              요청 지문
            </label>
            <textarea
              className="min-h-[140px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="지문 전문을 그대로 붙여 넣어주세요."
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                출처 (선택)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="예: 2024 수능"
                value={requestSource}
                onChange={(event) => setRequestSource(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                CC 이름 (선택)
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="예: 3-1 중간고사"
                value={requestCc}
                onChange={(event) => setRequestCc(event.target.value)}
              />
            </div>
          </div>

          {requestMessage ? (
            <p
              className={`text-sm ${
                requestStatus === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {requestMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
            disabled={requestStatus === "loading"}
          >
            {requestStatusLabel}
          </button>
        </form>
      </div>
    </section>
  );
}
