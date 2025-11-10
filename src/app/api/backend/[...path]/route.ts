import { NextRequest, NextResponse } from "next/server";

const BACKEND_ORIGIN =
  process.env.BACKEND_API_ORIGIN ||
  "http://ec2-3-38-193-220.ap-northeast-2.compute.amazonaws.com:8000";

const extractPathSegments = (request: NextRequest) =>
  request.nextUrl.pathname
    .replace(/^\/api\/backend\/?/, "")
    .split("/")
    .filter(Boolean);

async function proxyRequest(
  method: string,
  request: NextRequest,
  pathSegments: string[],
) {
  const query = request.nextUrl.searchParams.toString();
  const targetUrl = `${BACKEND_ORIGIN}/${pathSegments.join(
    "/",
  )}${query ? `?${query}` : ""}`;

  const headers = new Headers(request.headers);
  headers.set("host", BACKEND_ORIGIN.replace(/^https?:\/\//, ""));

  const init: RequestInit = {
    method,
    headers,
    body:
      method === "GET" || method === "DELETE" ? undefined : await request.text(),
  };

  const response = await fetch(targetUrl, init);
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-security-policy");
  responseHeaders.delete("content-length");
  responseHeaders.set("access-control-allow-origin", "*");

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest) {
  return proxyRequest("GET", request, extractPathSegments(request));
}

export async function POST(request: NextRequest) {
  return proxyRequest("POST", request, extractPathSegments(request));
}

export async function PUT(request: NextRequest) {
  return proxyRequest("PUT", request, extractPathSegments(request));
}

export async function DELETE(request: NextRequest) {
  return proxyRequest("DELETE", request, extractPathSegments(request));
}
