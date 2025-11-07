import { TokenGate } from "@/components/auth/token-gate";
import { TokenIndicator } from "@/components/auth/token-indicator";
import { TokenProvider } from "@/components/auth/token-context";
import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Scafold Reference Console",
  description: "국어 지문 참고자료를 위한 내부 전용 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-950 antialiased`}
      >
        <TokenProvider>
          <div className="min-h-screen">
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
                <div>
                  <Link href="/" className="text-lg font-semibold text-slate-900">
                    Scafold References
                  </Link>
                  <p className="text-xs text-slate-500">
                    관리자/선생님 전용 참고자료 허브
                  </p>
                </div>
                <nav className="flex items-center gap-4 text-sm">
                  <Link href="/" className="text-slate-700 hover:text-slate-900">
                    검색
                  </Link>
                  <Link
                    href="/admin"
                    className="text-slate-700 hover:text-slate-900"
                  >
                    관리자
                  </Link>
                </nav>
                <TokenIndicator />
              </div>
            </header>
            <TokenGate>
              <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
            </TokenGate>
          </div>
        </TokenProvider>
      </body>
    </html>
  );
}
