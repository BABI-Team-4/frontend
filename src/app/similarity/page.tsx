"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/auth-context";
import { recommendations } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";

interface RecommendedCase {
  company_name: string;
  job_role_name: string;
  similarity: number;
  common_keywords: string[];
  answer_preview?: string;
}

function SimilarityInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<RecommendedCase[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"similarity" | "company">("similarity");

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (!user) return;

    const sid = searchParams.get("session");
    const rid = searchParams.get("recommendation");

    if (rid) {
      recommendations.get(rid).then((res) => {
        if (res.success && res.data) {
          const items = (res.data as { items?: RecommendedCase[] }).items ?? [];
          setCases(items);
        }
        setLoadingData(false);
      });
    } else if (sid) {
      recommendations.create(sid, 10).then((res) => {
        if (res.success && res.data) {
          const recId = (res.data as { recommendation_id?: string }).recommendation_id;
          if (recId) {
            recommendations.get(recId).then((r2) => {
              if (r2.success && r2.data) {
                const items = (r2.data as { items?: RecommendedCase[] }).items ?? [];
                setCases(items);
              }
              setLoadingData(false);
            });
          } else setLoadingData(false);
        } else setLoadingData(false);
      });
    } else {
      setLoadingData(false);
    }
  }, [user, loading, router, searchParams]);

  const filtered = cases
    .filter((c) => !search || c.company_name.includes(search) || c.job_role_name.includes(search) || c.common_keywords.some((k) => k.includes(search)))
    .sort((a, b) => sortBy === "similarity" ? b.similarity - a.similarity : a.company_name.localeCompare(b.company_name));

  if (loading) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 px-8 py-4 border-b bg-white border-neutral-200">
          <h1 className="text-xl font-bold text-black">합격 자소서 유사도 분석</h1>
          <p className="text-sm mt-0.5 text-neutral-500">내 자소서와 유사한 합격 자소서를 찾아보세요</p>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          <div className="w-64 flex-shrink-0 border-r overflow-y-auto p-5 space-y-6 bg-white border-neutral-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input placeholder="기업, 직무 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3 text-neutral-400">정렬 기준</h3>
              <div className="space-y-1">
                {[
                  { key: "similarity", label: "유사도" },
                  { key: "company", label: "기업명" },
                ].map((s) => (
                  <button key={s.key} onClick={() => setSortBy(s.key as typeof sortBy)} className="w-full text-left px-3 py-2 rounded-xl text-sm transition-all" style={sortBy === s.key ? { background: "#eff6ff", color: "#2563eb", fontWeight: 600 } : { color: "#737373" }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loadingData ? (
              <div className="flex items-center justify-center py-20">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
                  </motion.div>
                  <p className="text-sm text-neutral-500">유사 자소서를 검색하고 있습니다...</p>
                </motion.div>
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="font-semibold mb-1 text-black">유사도 분석 결과가 없습니다</p>
                <p className="text-sm mb-4 text-neutral-500">에디터에서 자소서를 작성한 후 분석을 시작해주세요</p>
                <Link href="/editor">
                  <button className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ background: "#2563eb" }}>자소서 작성하기</button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-neutral-500">
                    <span className="font-semibold text-black">{filtered.length}개</span>의 유사 자소서를 찾았습니다
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {filtered.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <Card className="border border-neutral-200 shadow-none hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-sm text-black">{c.company_name}</h3>
                              <p className="text-xs text-neutral-500">{c.job_role_name}</p>
                            </div>
                            <div className="flex flex-col items-center px-3 py-2 rounded-full flex-shrink-0 bg-neutral-100">
                              <span className="font-display text-xl leading-none text-black">{Math.round(c.similarity * 100)}%</span>
                            </div>
                          </div>
                          <div className="mb-3 h-2 rounded-full overflow-hidden bg-neutral-200">
                            <div className="h-full rounded-full transition-all duration-700" style={{ background: "#2563eb", width: `${c.similarity * 100}%` }} />
                          </div>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {c.common_keywords.map((kw) => (
                              <span key={kw} className="text-xs px-2 py-0.5 rounded-full font-medium bg-neutral-100 text-neutral-600">{kw}</span>
                            ))}
                          </div>
                          {expandedIdx === i && c.answer_preview && (
                            <div className="p-3 rounded-xl text-xs leading-relaxed bg-neutral-50 text-neutral-600">{c.answer_preview}</div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
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
