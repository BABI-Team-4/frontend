"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UsageCardProps {
  analysisUsed: number;
  analysisLimit: number;
  recUsed: number;
  recLimit: number;
  plan: string;
  resetAt?: string;
}

export default function UsageCard({
  analysisUsed,
  analysisLimit,
  recUsed,
  recLimit,
  plan,
  resetAt,
}: UsageCardProps) {
  const analysisPercent = analysisLimit > 0 ? (analysisUsed / analysisLimit) * 100 : 0;
  const recPercent = recLimit > 0 ? (recUsed / recLimit) * 100 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Usage card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-black">이용 현황</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-medium">
            {plan}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-neutral-400">분석 사용량</span>
              <span className="text-xs font-semibold text-black tabular-nums">
                {analysisUsed}/{analysisLimit}
              </span>
            </div>
            <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(analysisPercent, 100)}%`,
                  background: analysisPercent > 80 ? "#dc2626" : "#2563eb",
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-neutral-400">추천 사용량</span>
              <span className="text-xs font-semibold text-black tabular-nums">
                {recUsed}
                /{recLimit}
              </span>
            </div>
            <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(recPercent, 100)}%`,
                  background: recPercent > 80 ? "#dc2626" : "#7c3aed",
                }}
              />
            </div>
          </div>
        </div>

        {resetAt && (
          <p className="text-xs text-neutral-400">
            {formatDate(resetAt)} 갱신
          </p>
        )}
      </div>

      {/* CTA card */}
      <div
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)" }}
      >
        <div>
          <p className="text-white text-sm font-bold leading-snug">AI 첨삭 시작하기</p>
          <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">
            자소서를 붙여넣으면 즉시 분석해드립니다
          </p>
        </div>
        <Link href="/editor">
          <Button className="w-full h-8 text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 border-none gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            지금 시작
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
