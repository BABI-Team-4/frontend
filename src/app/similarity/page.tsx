"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/lib/auth-context";
import { chat, recommendations, type ChatSession } from "@/lib/api";
import Link from "next/link";
import { Sparkles, ChevronRight, FileText, Clock } from "lucide-react";

interface RecommendedCase {
  rank: number;
  essay_id: number;
  qna_id: number;
  company_name: string;
  job_role_name: string;
  fit_score: number;
  question: string;
  answer: string;
  year: string;
  season: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return `${Math.floor(hrs / 24)}일 전`;
}

function SimilarityInner() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [cases, setCases] = useState<RecommendedCase[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (!user) return;
    chat.listSessions(1, 30).then((res) => {
      if (res.success) {
        const done = res.data.items.filter(
          (s) => s.status === "analyzed" || s.status === "closed" || s.status === "active"
        );
        setSessions(done);
      }
    });
  }, [user, loading, router]);

  const runAnalysis = async (session: ChatSession) => {
    setSelectedSession(session);
    setCases([]);
    setExpandedSet(new Set());
    setAnalyzing(true);
    try {
      const res = await recommendations.create(session.session_id, 10);
      if (res.success) {
        const recId = (res.data as { recommendation_id?: string }).recommendation_id;
        if (recId) {
          const r2 = await recommendations.get(recId);
          if (r2.success && r2.data) {
            const items = (r2.data as { items?: RecommendedCase[] }).items ?? [];
            setCases(items);
          }
        }
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleExpand = (i: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (loading) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-white flex-col lg:flex-row">
      <MobileHeader />
      <Sidebar />

      {/* 자소서 목록 패널 */}
      <div className="hidden md:flex flex-shrink-0 w-[260px] border-r border-neutral-200 flex-col bg-white">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-black">내 자소서</h2>
          <p className="text-xs text-neutral-400 mt-0.5">분석할 자소서를 선택하세요</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {sessions.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <FileText className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-xs text-neutral-400">작성한 자소서가 없습니다</p>
            </div>
          ) : (
            sessions.map((s) => {
              const isSelected = selectedSession?.session_id === s.session_id;
              return (
                <button
                  key={s.session_id}
                  onClick={() => runAnalysis(s)}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-neutral-50 flex items-start gap-3 ${isSelected ? "bg-blue-50" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? "bg-blue-100" : "bg-neutral-100"}`}>
                    <FileText className={`w-3.5 h-3.5 ${isSelected ? "text-blue-500" : "text-neutral-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{s.title || "제목 없음"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-neutral-300" />
                      <span className="text-[11px] text-neutral-400">{timeAgo(s.updated_at)}</span>
                    </div>
                  </div>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-1" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 결과 패널 */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50">
        <div className="px-8 py-4 border-b border-neutral-200 bg-white flex-shrink-0">
          <h1 className="text-sm font-semibold text-black">유사 합격 자소서 분석</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {selectedSession
              ? `"${selectedSession.title}" 기준으로 분석`
              : "왼쪽에서 자소서를 선택하면 분석을 시작합니다"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* 선택 전 */}
          {!selectedSession && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-neutral-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">자소서를 선택하세요</p>
                <p className="text-xs text-neutral-400 mt-1">내 자소서와 유사한 합격 사례를 찾아드립니다</p>
              </div>
            </div>
          )}

          {/* 분석 중 */}
          {analyzing && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-500"
              />
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-600">유사 자소서 검색 중...</p>
                <p className="text-xs text-neutral-400 mt-1">합격자 데이터베이스에서 유사한 사례를 찾고 있어요</p>
              </div>
            </div>
          )}

          {/* 결과 없음 */}
          {!analyzing && selectedSession && cases.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-sm text-neutral-500">유사한 합격 자소서를 찾지 못했습니다</p>
            </div>
          )}

          {/* 결과 */}
          {!analyzing && cases.length > 0 && (
            <div>
              <p className="text-xs text-neutral-400 mb-5">
                <span className="font-semibold text-neutral-700">{cases.length}개</span>의 유사 합격 자소서를 찾았습니다
              </p>
              <div className="space-y-3">
                {cases
                  .sort((a, b) => b.fit_score - a.fit_score)
                  .map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className="bg-white border border-neutral-200 rounded-xl overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
                        onClick={() => toggleExpand(i)}
                      >
                        <div className="flex-shrink-0 w-12 flex items-baseline justify-center gap-0.5">
                          <span className="text-lg font-bold text-black leading-none">{c.fit_score}</span>
                          <span className="text-[10px] text-neutral-400">%</span>
                        </div>

                        <div className="w-px h-8 bg-neutral-100 flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-black">{c.company_name}</p>
                            {c.job_role_name && (
                              <span className="text-[11px] text-neutral-400">· {c.job_role_name}</span>
                            )}
                          </div>
                          <div className="mt-1.5 h-1 rounded-full bg-neutral-100 overflow-hidden w-full max-w-xs">
                            <motion.div
                              className="h-full rounded-full bg-blue-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${c.fit_score}%` }}
                              transition={{ delay: i * 0.04 + 0.1, duration: 0.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-1.5 items-center flex-shrink-0">
                          {(c.year || c.season) && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                              {[c.year, c.season].filter(Boolean).join(" ")}
                            </span>
                          )}
                        </div>

                        <ChevronRight
                          className="w-4 h-4 text-neutral-300 flex-shrink-0 transition-transform"
                          style={{ transform: expandedSet.has(i) ? "rotate(90deg)" : "none" }}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedSet.has(i) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-neutral-100"
                          >
                            <div className="px-5 py-4 bg-neutral-50 space-y-3">
                              {c.question && (
                                <div>
                                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">질문</p>
                                  <p className="text-xs text-neutral-700 leading-relaxed font-medium">{c.question}</p>
                                </div>
                              )}
                              {c.answer && (
                                <div>
                                  <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">합격 자소서</p>
                                  <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">{c.answer}</p>
                                </div>
                              )}
                              <div className="pt-1">
                                <Link
                                  href={c.essay_id ? `/library/${c.essay_id}` : `/library?keyword=${encodeURIComponent(c.company_name)}`}
                                  className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                                >
                                  전체 자소서 보기 →
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SimilarityPage() {
  return (
    <Suspense>
      <SimilarityInner />
    </Suspense>
  );
}
