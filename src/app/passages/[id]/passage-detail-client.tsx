"use client";

import { useToken } from "@/components/auth/token-context";
import { apiFetch, ApiError } from "@/lib/api-client";
import type { Passage, Reference, ReferenceStructuredItem } from "@/types/api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Props {
  passageId: string;
}

export const PassageDetailClient = ({ passageId }: Props) => {
  const { token } = useToken();
  const [passage, setPassage] = useState<Passage | null>(null);
  const [reference, setReference] = useState<Reference | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const fetchReference = useCallback(async () => {
    try {
      const referenceData = await apiFetch<Reference>(
        `/v1/references/by-passage/${passageId}`,
        {
          token,
        },
      );
      setReference(referenceData);
      setError(null);
    } catch (err) {
      setReference(null);
      if (err instanceof ApiError && err.status === 404) {
        setError(null);
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("참고자료를 불러오는 중 문제가 발생했습니다.");
      }
    }
  }, [passageId, token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const passageData = await apiFetch<Passage>(`/v1/passages/${passageId}`, {
          token,
        });
        setPassage(passageData);
        await fetchReference();
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
  }, [fetchReference, passageId, token]);

  const structuredItems = useMemo<ReferenceStructuredItem[]>(() => {
    if (!reference?.structured_payload) return [];
    return reference.structured_payload.items ?? [];
  }, [reference]);

  const handleCopy = async (text: string) => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(text);
  };

  const handleGenerateReference = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const generated = await apiFetch<Reference>("/v1/references/generate", {
        method: "POST",
        token,
        body: { passage_id: passageId },
      });
      setReference(generated);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        setGenerateError(err.message);
      } else {
        setGenerateError("참고자료 생성에 실패했습니다.");
      }
    } finally {
      setGenerating(false);
    }
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
              <p className="text-sm text-slate-500">
                {passage.source ?? "출처 미상"}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">지문 상세</h1>
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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              참고자료 카드
            </h2>
            <p className="text-sm text-slate-500">
              각 카드마다 문단 칩을 눌러 출처를확인하고, 문제/정답을 복사하세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {reference?.llm_model ? (
              <span className="text-xs text-slate-500">
                생성 모델: {reference.llm_model}
              </span>
            ) : null}
            <button
              onClick={handleGenerateReference}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={generating}
            >
              {generating ? "생성 중..." : "참고자료 생성"}
            </button>
          </div>
        </div>
        {generateError ? (
          <p className="text-sm text-red-600">{generateError}</p>
        ) : null}

        {structuredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            참고자료가 아직 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {structuredItems.map((item, idx) => (
              <QuestionCard
                key={`${item.type}-${item.paragraph ?? item.index}-${idx}`}
                item={item}
                onCopyQuestion={() => handleCopy(item.question)}
                onCopyAnswer={() =>
                  handleCopy(
                    `정답: ${item.correct_answer}\n해설: ${item.explanation}`,
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      {reference && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            전체 문제/답안 복사
          </h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => handleCopy(reference.questions)}
            >
              문제 전체 복사
            </button>
            <button
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => handleCopy(reference.answers)}
            >
              답안 전체 복사
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

interface QuestionCardProps {
  item: ReferenceStructuredItem;
  onCopyQuestion: () => void;
  onCopyAnswer: () => void;
}

const QuestionCard = ({
  item,
  onCopyQuestion,
  onCopyAnswer,
}: QuestionCardProps) => {
  const chipLabel =
    item.type === "paragraph"
      ? `문단 ${item.paragraph ?? "-"}`
      : `통합 ${item.index ?? "-"}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {chipLabel}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            onClick={onCopyQuestion}
          >
            질문 복사
          </button>
          <button
            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
            onClick={onCopyAnswer}
          >
            답안 복사
          </button>
        </div>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-slate-800">
        <div>
          <p className="font-semibold text-slate-900">질문</p>
          <p>{item.question}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">정답</p>
          <p>{item.correct_answer}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">해설</p>
          <p className="whitespace-pre-wrap">{item.explanation}</p>
        </div>
      </div>
    </article>
  );
};
