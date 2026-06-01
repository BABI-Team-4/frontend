"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/lib/auth-context";
import { analysis, type AnalysisResult } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Sparkles, ArrowLeft, Download, Copy, CheckCircle2,
  AlertCircle, Lightbulb, TrendingUp, Zap,
} from "lucide-react";

function ReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const analysisParam = searchParams.get("analysis");
  const sessionParam = searchParams.get("session");

  const [analysisId, setAnalysisId] = useState<string | null>(() => analysisParam);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<string>(() => analysisParam ? "polling" : "idle");
  const [progress, setProgress] = useState(0);
  const [scoreVisible, setScoreVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || loading) return;
    if (!analysisParam && sessionParam) {
      analysis.create(sessionParam).then((res) => {
        if (res.success) { setAnalysisId(res.data.analysis_id); setStatus("polling"); }
        else setStatus("error");
      });
    }
  }, [user, loading, analysisParam, sessionParam]);

  useEffect(() => {
    if (status !== "polling" || !analysisId) return;
    const interval = setInterval(async () => {
      const res = await analysis.getStatus(analysisId);
      if (res.success) {
        setProgress(res.data.progress);
        if (res.data.status === "completed") {
          clearInterval(interval);
          const resultRes = await analysis.getResult(analysisId);
          if (resultRes.success) { setResult(resultRes.data); setStatus("done"); }
        } else if (res.data.status === "failed") { clearInterval(interval); setStatus("error"); }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [status, analysisId]);

  useEffect(() => {
    if (status !== "done" || !result) return;
    const timer = setTimeout(() => {
      setScoreVisible(true);
      const target = result.scores.overall_fit;
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        setAnimatedScore(Math.min(current, target));
        if (current >= target) clearInterval(interval);
      }, 20);
    }, 400);
    return () => clearTimeout(timer);
  }, [status, result]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  const handleCopy = () => {
    if (result?.essay_feedback?.feedback) navigator.clipboard.writeText(result.essay_feedback.feedback);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return null;

  if (status === "polling" || status === "idle") {
    return (
      <div className="flex flex-col lg:flex-row h-[var(--app-viewport-height)] overflow-hidden">
        <MobileHeader />
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-neutral-50">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "#2563eb" }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-lg font-bold mb-2 text-black">AI 분석 진행 중...</h2>
            <p className="text-sm mb-4 text-neutral-500">자소서를 꼼꼼하게 분석하고 있습니다</p>
            <div className="w-64 h-2 rounded-full overflow-hidden mx-auto bg-neutral-200">
              <motion.div
                className="h-full rounded-full" style={{ background: "#2563eb" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs mt-2 text-neutral-400">{progress}%</p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (status === "error" || !result) {
    return (
      <div className="flex flex-col lg:flex-row h-[var(--app-viewport-height)] overflow-hidden">
        <MobileHeader />
        <Sidebar />
        <main className="flex-1 flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-lg font-bold mb-2 text-black">분석에 실패했습니다</h2>
            <p className="text-sm mb-4 text-neutral-500">세션을 선택한 후 다시 시도해주세요</p>
            <Link href="/editor">
              <button className="px-4 py-2 rounded-full text-sm font-semibold text-white" style={{ background: "#2563eb" }}>에디터로 돌아가기</button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const scores = [
    { label: "전체 점수", value: result.scores.overall_fit },
    { label: "인재상 적합도", value: result.scores.talent_fit },
    { label: "JD 키워드", value: result.scores.jd_keyword_fit },
    { label: "합격자소서 유사도", value: result.scores.accepted_cover_letter_similarity },
    { label: "구체성", value: result.scores.specificity },
  ];

  const grade = (v: number) => v >= 90 ? "A+" : v >= 80 ? "A" : v >= 70 ? "B+" : v >= 60 ? "B" : "C";

  return (
    <div className="flex h-[var(--app-viewport-height)] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 px-4 md:px-8 py-4 border-b flex items-center justify-between bg-white border-neutral-200">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link href="/editor">
              <button className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-black transition-colors flex-shrink-0">
                <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">에디터로</span>
              </button>
            </Link>
            <span className="text-neutral-300 hidden sm:inline">/</span>
            <span className="text-sm font-bold text-black truncate">AI 첨삭 결과</span>
            <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-neutral-100 text-neutral-700 flex-shrink-0">
              <CheckCircle2 className="w-3 h-3" /> 첨삭 완료
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "복사됨!" : "피드백 복사"}</span>
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors">
              <Download className="w-3.5 h-3.5" /> PDF 저장
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-5">
            <Card className="border-0 shadow-none overflow-hidden" style={{ background: "#0f172a" }}>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2563eb" }}>
                    <Zap className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-sm font-medium text-neutral-400">
                    {result.target_company.name} · {result.target_job_role.name}
                  </span>
                </div>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#262626" strokeWidth="8" />
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="339.3" strokeDashoffset={scoreVisible ? 339.3 * (1 - result.scores.overall_fit / 100) : 339.3} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-4xl text-white leading-none">{animatedScore}</span>
                    <span className="text-xs mt-1 text-neutral-500">/ 100</span>
                  </div>
                </div>
                <span className="font-display text-2xl text-white">{grade(result.scores.overall_fit)}등급</span>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 shadow-none">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-sm flex items-center gap-2 text-black">
                  <TrendingUp className="w-4 h-4" /> 세부 평가 항목
                </h3>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {scores.slice(1).map((score) => (
                  <div key={score.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-neutral-600">{score.label}</span>
                      <div className="flex items-center gap-2 text-nowrap">
                        <span className="text-xs font-bold text-black">{score.value}점</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-neutral-100 text-neutral-700">{grade(score.value)}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-neutral-200">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ background: "#2563eb", width: scoreVisible ? `${score.value}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 shadow-none">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-sm text-black">AI 상세 피드백</h3>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-600">강점</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-600">{result.summary.strength}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-600">약점</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-600">{result.summary.weakness}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-600">전략 제안</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-600">{result.summary.strategy}</p>
                </div>
                {result.essay_feedback?.risk_points?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-semibold text-red-600">주의사항</span>
                    </div>
                    <ul className="space-y-1">
                      {result.essay_feedback.risk_points.map((rp, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-neutral-600">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-400" />{rp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <Card className="border border-neutral-200 shadow-none">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-sm text-black">자소서 피드백</h3>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-black">피드백 점수: {result.essay_feedback.score}점</span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-700">{result.essay_feedback.feedback}</p>
                {result.essay_feedback.recommended_direction && (
                  <div className="p-4 rounded-xl bg-neutral-50">
                    <p className="text-xs font-semibold mb-1 text-black">추천 방향</p>
                    <p className="text-sm leading-relaxed text-neutral-600">{result.essay_feedback.recommended_direction}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 shadow-none">
              <CardHeader className="pb-3">
                <h3 className="font-bold text-sm text-black">키워드 분석</h3>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="text-xs font-semibold mb-2 text-emerald-600">매칭된 키워드</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.matched_keywords.map((kw) => (
                      <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-amber-600">누락된 키워드</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyword_analysis.missing_keywords.map((kw) => (
                      <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{kw}</span>
                    ))}
                  </div>
                </div>
                {result.keyword_analysis.recommended_keywords.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2 text-neutral-700">추천 키워드</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keyword_analysis.recommended_keywords.map((kw) => (
                        <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {result.similar_accepted_cases.length > 0 && (
              <Card className="border border-neutral-200 shadow-none">
                <CardHeader className="pb-3">
                  <h3 className="font-bold text-sm text-black">유사 합격 자소서</h3>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {result.similar_accepted_cases.map((c, i) => (
                    <div key={i} className="p-4 rounded-xl flex items-center justify-between bg-neutral-50 border border-neutral-200">
                      <div>
                        <p className="text-sm font-semibold text-black">{c.company_name} · {c.job_role_name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.common_keywords.map((kw) => (
                            <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{kw}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-center flex-shrink-0 ml-4">
                        <span className="font-display text-xl text-black">{Math.round(c.similarity * 100)}%</span>
                        <p className="text-xs text-neutral-400">유사도</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="border border-neutral-200 shadow-none bg-neutral-50">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-black">합격 자소서와 더 비교해보세요</h4>
                  <p className="text-xs text-neutral-500">유사도 분석 페이지에서 더 많은 합격 자소서를 확인하세요</p>
                </div>
                <Link href="/similarity">
                  <button className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap text-white" style={{ background: "#2563eb" }}>유사도 분석</button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense>
      <ReviewInner />
    </Suspense>
  );
}
