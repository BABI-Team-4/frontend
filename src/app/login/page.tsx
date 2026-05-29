"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi } from "@/lib/api";
import { motion } from "framer-motion";
import { Zap, AlertCircle, User } from "lucide-react";

const TEST_ACCOUNTS = [
  { email: "test@example.com", name: "박지훈", plan: "Free", desc: "무료 사용자" },
  { email: "pro@example.com", name: "김서연", plan: "Pro", desc: "유료 사용자" },
  { email: "admin@example.com", name: "관리자", plan: "Admin", desc: "관리자 권한" },
];

function LoginCircles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 500, x: "-15%", y: "-10%", delay: 0, duration: 25 },
        { size: 400, x: "60%", y: "10%", delay: 1, duration: 20 },
        { size: 300, x: "70%", y: "60%", delay: 2, duration: 22 },
        { size: 250, x: "20%", y: "70%", delay: 3, duration: 18 },
      ].map((circle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: circle.size,
            height: circle.size,
            left: circle.x,
            top: circle.y,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -25, 15, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{ duration: circle.duration, repeat: Infinity, ease: "easeInOut", delay: circle.delay }}
        />
      ))}
    </div>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const { login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(error);

  const handleDevLogin = async (email: string) => {
    setLoading(email);
    setLoginError(null);
    try {
      const res = await authApi.devLogin(email);
      if (res.success) {
        await login(res.data.access_token, res.data.refresh_token);
        router.push("/dashboard");
      } else {
        setLoginError("로그인에 실패했습니다.");
        setLoading(null);
      }
    } catch {
      setLoginError("서버에 연결할 수 없습니다.");
      setLoading(null);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] h-full flex-shrink-0 p-12 relative overflow-hidden" style={{ background: "#0f172a" }}>
        <LoginCircles />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#2563eb" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">자소서AI</span>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight mb-4">
              AI 자기소개서<br />
              <span className="text-neutral-400">첨삭 플랫폼</span>
            </h2>
            <p className="text-base leading-relaxed text-neutral-500">
              3만여 개의 합격 자소서 데이터 기반<br />AI 첨삭 및 유사도 분석 서비스
            </p>
          </div>
          <div className="space-y-3">
            {["AI 기반 실시간 자소서 첨삭", "합격 자소서 유사도 분석", "기업·직무별 맞춤 키워드 제안"].map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3b82f6" }} />
                <span className="text-sm text-neutral-400">{f}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-neutral-600 relative z-10">&copy; 2026 자소서AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2563eb" }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-black">자소서AI</span>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-black">테스트 계정 로그인</h1>
          <p className="text-sm mb-6 text-neutral-500">계정을 선택하여 로그인하세요</p>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl flex items-start gap-3 bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="text-sm text-red-600">{loginError}</p>
            </div>
          )}

          <div className="space-y-3">
            {TEST_ACCOUNTS.map((acc) => (
              <motion.button
                key={acc.email}
                onClick={() => handleDevLogin(acc.email)}
                disabled={loading !== null}
                className="w-full p-4 rounded-xl text-left flex items-center gap-4 border border-neutral-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 disabled:opacity-60 transition-all"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "#2563eb" }}>
                  {loading === acc.email ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    acc.name[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-black">{acc.name}</div>
                  <div className="text-xs text-neutral-500">{acc.desc}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-neutral-100 text-neutral-600">{acc.plan}</span>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-xs mt-8 text-neutral-400">
            테스트 환경입니다. 실제 서비스에서는 OAuth 로그인을 사용합니다.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
