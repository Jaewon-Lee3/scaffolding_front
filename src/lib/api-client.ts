"use client";

import { API_BASE_URL, TOKEN_HEADER } from "@/lib/config";

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiRequestOptions<TBody = unknown> {
  method?: ApiMethod;
  token?: string | null;
  body?: TBody;
  searchParams?: Record<string, string>;
  headers?: HeadersInit;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const buildUrl = (path: string, searchParams?: Record<string, string>) => {
  const url = new URL(path, API_BASE_URL);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
};

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", token, body, searchParams, headers } = options;
  const url = buildUrl(path, searchParams);

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [TOKEN_HEADER]: token } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const message = await res
      .json()
      .catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, message.detail ?? "API request failed");
  }

  return (await res.json()) as TResponse;
}
