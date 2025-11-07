"use client";

import { useToken } from "@/components/auth/token-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Passage, Reference } from "@/types/api";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  params: { id: string };
}

export default function PassageDetailPage({ params }: Props) {
  const { token } = useToken();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [reference, setReference] = useState<Reference | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [passageData, referenceData] = await Promise.all([
          apiFetch<Passage>(`/v1/passages/${params.id}`, { token }),
          apiFetch<Reference>(`/v1/references/by-passage/${params.id}`, {
            token,
          }),
        ]);
        setPassage(passageData);
        setReference(referenceData);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("지문 상세를 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, token]);

  const handleCopy = async (text: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <section className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
      >
        ← 검색으로 돌아가기
      </Link>

      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <p className="text-sm text-slate-500">불러오는 중입니다...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : passage ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">{passage.source}</p>
              <h1 className="text-2xl font-bold text-slate-900">
                지문 상세
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {passage.cc_labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">
                  원본 지문
                </h2>
                <button
                  onClick={() => handleCopy(passage.text)}
                  className="text-xs font-medium text-slate-600 underline underline-offset-4"
                >
                  복사
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                {passage.text}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">참고자료</p>
              <h3 className="text-lg font-semibold text-slate-900">문제</h3>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-slate-600 underline underline-offset-4"
              onClick={() => reference && handleCopy(reference.questions)}
              disabled={!reference}
            >
              복사
            </button>
          </header>
          <div className="min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {reference ? reference.questions : "참고자료가 아직 없습니다."}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">참고자료</p>
              <h3 className="text-lg font-semibold text-slate-900">답안</h3>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-slate-600 underline underline-offset-4"
              onClick={() => reference && handleCopy(reference.answers)}
              disabled={!reference}
            >
              복사
            </button>
          </header>
          <div className="min-h-[200px] whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {reference ? reference.answers : "참고자료가 아직 없습니다."}
          </div>
        </div>
      </div>
    </section>
  );
}
