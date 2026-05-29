"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/auth-context";
import { chat, type ChatSession } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus, FileText, Clock, TrendingUp, Sparkles,
  ChevronRight, Bell, Search, Flame,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, usage, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (user) {
      chat.listSessions(1, 10).then((res) => {
        if (res.success) setSessions(res.data.items);
      });
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">로딩 중...</p>
      </div>
    );
  }

  const analysisUsed = usage?.monthly_analysis_used ?? 0;
  const analysisLimit = usage?.monthly_analysis_limit ?? 30;
  const recUsed = usage?.monthly_recommendation_used ?? 0;

  const statusLabel = (s: ChatSession) => {
    if (s.status === "closed" || s.status === "analyzed") return { text: "첨삭완료", color: "#10b981" };
    if (s.status === "active") return { text: "작성중", color: "#0a0a0a" };
    return { text: s.status, color: "#737373" };
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}시간 전`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}일 전`;
    return `${Math.floor(days / 7)}주 전`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between border-b bg-white border-neutral-200">
          <div>
            <h1 className="text-xl font-bold text-black">안녕하세요, {user?.name ?? "사용자"}님</h1>
            <p className="text-sm text-neutral-500">오늘도 합격에 한 걸음 더 다가가 보세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-neutral-100 text-neutral-500">
              <Search className="w-4 h-4" />
              <span>자소서 검색...</span>
            </div>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors">
              <Bell className="w-4 h-4 text-neutral-500" />
            </button>
            <Link href="/editor">
              <Button className="h-9 px-4 text-sm font-semibold flex items-center gap-2 text-white border-none" style={{ background: "#2563eb" }}>
                <Plus className="w-4 h-4" />
                새 자소서
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stats row */}
          <div className="grid grid-cols-4 gap-5">
            {[
              { label: "내 자소서", value: `${sessions.length}개`, sub: "", icon: FileText },
              { label: "첨삭 사용", value: `${analysisUsed}건`, sub: `한도 ${analysisLimit}건`, icon: TrendingUp },
              { label: "추천 사용", value: `${recUsed}건`, sub: `한도 ${usage?.monthly_recommendation_limit ?? 0}건`, icon: Sparkles },
              { label: "남은 크레딧", value: `${analysisLimit - analysisUsed}개`, sub: `${analysisUsed}/${analysisLimit} 사용`, icon: Flame },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <Card className="border border-neutral-200 shadow-none hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm mb-1 text-neutral-500">{stat.label}</p>
                          <p className="text-2xl font-bold text-black">{stat.value}</p>
                          <p className="text-xs mt-1 text-neutral-400">{stat.sub}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-neutral-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* My cover letters */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-black">내 자기소개서</h2>
                <Link href="/editor" className="text-sm flex items-center gap-1 text-neutral-500 hover:text-black transition-colors">
                  전체보기 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {sessions.length === 0 ? (
                <Card className="border border-neutral-200 shadow-none">
                  <CardContent className="p-8 text-center">
                    <p className="text-sm text-neutral-500">아직 작성한 자소서가 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session, i) => {
                    const st = statusLabel(session);
                    return (
                      <motion.div
                        key={session.session_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                      >
                        <Link href={`/editor?session=${session.session_id}`}>
                          <Card className="border border-neutral-200 shadow-none hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-semibold text-sm leading-snug text-black">{session.title}</h3>
                                      <span className="text-xs text-neutral-400">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {timeAgo(session.updated_at)}
                                      </span>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0" style={{ background: `${st.color}15`, color: st.color }}>
                                      {st.text}
                                    </span>
                                  </div>
                                  {session.last_message && (
                                    <p className="text-xs mt-2 line-clamp-1 text-neutral-500">{session.last_message}</p>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1 text-neutral-400" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <Link href="/editor">
                <button className="w-full py-4 border-2 border-dashed rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border-neutral-200 text-neutral-500 hover:border-neutral-400 transition-colors">
                  <Plus className="w-4 h-4" />
                  새 자기소개서 작성하기
                </button>
              </Link>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <Card className="border border-neutral-200 shadow-none">
                <CardHeader className="pb-3">
                  <h3 className="font-bold text-sm text-black">이용 현황</h3>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-500">분석 사용량</span>
                      <span className="text-xs font-semibold text-black">{analysisUsed}/{analysisLimit}</span>
                    </div>
                    <Progress value={analysisLimit > 0 ? (analysisUsed / analysisLimit) * 100 : 0} className="h-1.5" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-500">추천 사용량</span>
                      <span className="text-xs font-semibold text-black">{recUsed}/{usage?.monthly_recommendation_limit ?? 0}</span>
                    </div>
                    <Progress value={(usage?.monthly_recommendation_limit ?? 0) > 0 ? (recUsed / (usage?.monthly_recommendation_limit ?? 1)) * 100 : 0} className="h-1.5" />
                  </div>
                  <p className="text-xs text-neutral-400">
                    플랜: <span className="font-semibold text-black">{usage?.plan ?? user?.plan ?? "free"}</span>
                    {usage?.reset_at && ` · ${new Date(usage.reset_at).toLocaleDateString("ko-KR")} 갱신`}
                  </p>
                </CardContent>
              </Card>

              <div className="p-5 rounded-2xl text-center border" style={{ background: "#2563eb", borderColor: "#1d4ed8" }}>
                <div className="font-display text-white text-lg mb-1">AI 첨삭 시작</div>
                <p className="text-xs mb-4 text-neutral-500">
                  자소서를 붙여넣으면<br />즉시 AI가 분석해드립니다
                </p>
                <Link href="/editor">
                  <Button className="w-full h-9 text-sm font-semibold bg-white text-black hover:bg-neutral-100 border-none">
                    <Sparkles className="w-4 h-4 mr-2" />
                    지금 바로 시작
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
