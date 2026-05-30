"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0원",
    description: "가볍게 자소서를 점검하는 사용자용",
    features: ["월 30회 AI 첨삭", "합격 자소서 라이브러리", "기본 유사도 분석"],
  },
  {
    name: "Pro",
    price: "9,900원",
    description: "지원 시즌에 여러 문서를 관리하는 사용자용",
    features: ["월 200회 AI 첨삭", "문항별 고급 피드백", "우선 처리"],
  },
  {
    name: "Team",
    price: "문의",
    description: "스터디, 동아리, 기관 단위 사용",
    features: ["팀 사용량 관리", "공유 라이브러리", "관리자 리포트"],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { user, usage, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return null;

  const analysisUsed = usage?.monthly_analysis_used ?? 0;
  const analysisLimit = usage?.monthly_analysis_limit ?? 30;
  const recUsed = usage?.monthly_recommendation_used ?? 0;
  const recLimit = usage?.monthly_recommendation_limit ?? 0;
  const analysisPercent = analysisLimit > 0 ? Math.min(100, (analysisUsed / analysisLimit) * 100) : 0;
  const recPercent = recLimit > 0 ? Math.min(100, (recUsed / recLimit) * 100) : 0;

  return (
    <div className="flex h-[var(--app-viewport-height)] overflow-hidden bg-white flex-col lg:flex-row">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <header className="mb-6">
            <h1 className="text-xl font-bold text-black">요금제</h1>
            <p className="mt-1 text-sm text-neutral-500">현재 플랜과 이번 달 사용량을 확인합니다.</p>
          </header>

          <section className="mb-6 rounded-lg border border-neutral-200 bg-white">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
              <CreditCard className="h-4 w-4 text-neutral-500" />
              <h2 className="text-sm font-semibold text-black">현재 플랜</h2>
            </div>
            <div className="grid gap-5 px-5 py-5 md:grid-cols-[220px_1fr]">
              <div>
                <div className="text-xs text-neutral-400">사용 중인 플랜</div>
                <div className="mt-1 text-2xl font-bold capitalize text-black">{usage?.plan ?? user?.plan ?? "free"}</div>
                <div className="mt-2 text-xs text-neutral-400">
                  {usage?.reset_at ? `${new Date(usage.reset_at).toLocaleDateString("ko-KR")} 갱신` : "갱신일 정보 없음"}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">AI 첨삭</span>
                    <span className="font-mono text-neutral-500">{analysisUsed}/{analysisLimit}</span>
                  </div>
                  <Progress value={analysisPercent} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-neutral-500">추천 분석</span>
                    <span className="font-mono text-neutral-500">{recUsed}/{recLimit}</span>
                  </div>
                  <Progress value={recPercent} />
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const active = (usage?.plan ?? user?.plan ?? "free").toLowerCase() === plan.name.toLowerCase();
              return (
                <section key={plan.name} className="rounded-lg border border-neutral-200 bg-white p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-black">{plan.name}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{plan.description}</p>
                    </div>
                    {active && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-600">
                        현재
                      </span>
                    )}
                  </div>
                  <div className="mb-5 flex items-end gap-1">
                    <span className="text-2xl font-bold text-black">{plan.price}</span>
                    {plan.price !== "문의" && <span className="pb-1 text-xs text-neutral-400">/월</span>}
                  </div>
                  <div className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button className="mt-5 w-full gap-1.5" variant={active ? "outline" : "default"}>
                    {active ? <Zap className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {active ? "사용 중" : "선택"}
                  </Button>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
