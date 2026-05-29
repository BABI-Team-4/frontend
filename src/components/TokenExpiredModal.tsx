"use client";

import { useRouter } from "next/navigation";
import { Zap, X, ArrowRight, Gift } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function TokenExpiredModal({ onClose }: Props) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login?reason=token_expired&callbackUrl=/editor");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(4, 8, 15, 0.6)", backdropFilter: "blur(6px)" }}>
      <div
        className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden animate-slide-in-up"
        style={{ background: "white", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
      >
        {/* Header gradient */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{ background: "linear-gradient(135deg, oklch(0.14 0.05 255), oklch(0.2 0.07 264))" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4" style={{ color: "oklch(0.6 0.04 264)" }} />
          </button>

          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-float"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.22 264), oklch(0.65 0.18 220))" }}
          >
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-2xl text-white mb-2">AI 크레딧 소진</h2>
          <p className="text-sm" style={{ color: "oklch(0.65 0.05 264)" }}>
            이번 달 무료 AI 첨삭 크레딧을 모두 사용했습니다.
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-4">
          {/* Benefits */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: "oklch(0.97 0.02 264)", border: "1px solid oklch(0.9 0.03 264)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4" style={{ color: "oklch(0.48 0.22 264)" }} />
              <span className="text-sm font-semibold" style={{ color: "oklch(0.25 0.05 264)" }}>
                로그인하면 매월 무료 제공
              </span>
            </div>
            <ul className="space-y-2">
              {[
                "AI 첨삭 크레딧 30개 / 월",
                "합격 자소서 무제한 열람",
                "유사도 분석 무제한 이용",
                "첨삭 기록 영구 저장",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.4 0.03 264)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "oklch(0.55 0.18 264)" }} />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA buttons */}
          <button
            onClick={handleLogin}
            className="w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.22 264), oklch(0.6 0.18 220))",
              color: "white",
              boxShadow: "0 4px 16px oklch(0.48 0.22 264 / 0.35)",
            }}
          >
            로그인하고 계속하기
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full h-10 rounded-2xl text-sm transition-all"
            style={{ color: "oklch(0.55 0.03 264)" }}
          >
            나중에 하기
          </button>
        </div>
      </div>
    </div>
  );
}
