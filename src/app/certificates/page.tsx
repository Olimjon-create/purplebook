"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

import React from "react";
interface Certificate {
  id: string;
  certificateId: string;
  issuedAt: string;
  practiceTest: { title: string; subject: string };
  testResult: {
    score: number;
    totalQuestions: number;
    timeTaken: number | null;
    completedAt: string;
  };
}

export default function CertificatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => {
        setCerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (status === "loading" || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );

  if (!session) return null;

  return (
    <div className="min-h-screen bg-purple-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold text-purple-950"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            My Certificates
          </h1>
          <p className="text-gray-500 mt-2">
            Certificates are awarded after completing at least 2 practice tests.
          </p>
        </div>

        {certs.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎓</div>
            <h2
              className="text-xl font-bold text-purple-950 mb-2"
              style={{ fontFamily: "Playfair Display, Georgia, serif" }}
            >
              No certificates yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Complete at least 2 practice tests to earn your first completion
              certificate.
            </p>
            <Link href="/practice-tests" className="btn-primary inline-block">
              Browse Tests →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {certs.map((cert, i) => {
              const pct = Math.round(
                (cert.testResult.score / cert.testResult.totalQuestions) * 100
              );
              const grade =
                pct >= 90
                  ? "A"
                  : pct >= 80
                  ? "B"
                  : pct >= 70
                  ? "C"
                  : pct >= 60
                  ? "D"
                  : "F";
              const gradeColor =
                pct >= 80
                  ? "text-green-600"
                  : pct >= 60
                  ? "text-yellow-600"
                  : "text-red-600";
              const completedDate = new Date(
                cert.testResult.completedAt
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              const mins = cert.testResult.timeTaken
                ? Math.floor(cert.testResult.timeTaken / 60)
                : null;

              return (
                <div
                  key={cert.id}
                  className="card border border-yellow-200 bg-gradient-to-r from-white to-amber-50 flex flex-col sm:flex-row items-start sm:items-center gap-5 fade-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Medal icon */}
                  <div className="shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shadow-md">
                    🏅
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-gray-900 text-lg leading-tight truncate"
                      style={{ fontFamily: "Playfair Display, Georgia, serif" }}
                    >
                      {cert.practiceTest.title}
                    </h3>
                    <p className="text-xs text-purple-600 font-medium mt-0.5">
                      {cert.practiceTest.subject}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>📅 {completedDate}</span>
                      {mins !== null && <span>⏱ {mins} min</span>}
                      <span className="font-mono text-gray-400">
                        ID: {cert.certificateId}
                      </span>
                    </div>
                  </div>

                  <div className="text-center shrink-0">
                    <div
                      className={`text-3xl font-bold ${gradeColor}`}
                      style={{ fontFamily: "Playfair Display, Georgia, serif" }}
                    >
                      {grade}
                    </div>
                    <div className="text-sm font-bold text-gray-700">
                      {pct}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {cert.testResult.score}/{cert.testResult.totalQuestions}
                    </div>
                  </div>

                  {/* Download */}
                  <a
                    href={`/api/certificates/${cert.id}/download`}
                    download
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm"
                  >
                    ⬇ PDF
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-purple-700 hover:text-purple-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
