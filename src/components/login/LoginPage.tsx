"use client";

import Image from "next/image";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const BALLS = [
  { size: 120, x: "15%", y: "20%", color: "rgba(99,102,241,0.35)", duration: 7, delay: 0 },
  { size: 80, x: "60%", y: "10%", color: "rgba(59,130,246,0.4)", duration: 9, delay: 1 },
  { size: 160, x: "75%", y: "55%", color: "rgba(99,102,241,0.2)", duration: 11, delay: 0.5 },
  { size: 60, x: "30%", y: "65%", color: "rgba(147,197,253,0.5)", duration: 8, delay: 2 },
  { size: 100, x: "50%", y: "80%", color: "rgba(59,130,246,0.25)", duration: 10, delay: 1.5 },
  { size: 50, x: "85%", y: "25%", color: "rgba(165,180,252,0.5)", duration: 6, delay: 0.8 },
  { size: 90, x: "10%", y: "80%", color: "rgba(96,165,250,0.3)", duration: 12, delay: 3 },
];

// 테스트 계정
const CREDENTIALS: Record<string, string> = {
  "test@example.com": "test1234",
  "pro@example.com": "pro1234",
  "admin@example.com": "admin1234",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(error);

  const handleOAuthLogin = async (provider: "kakao" | "google") => {
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
    const res = await authApi.getOAuthUrl(provider, redirectUri);
    if (res.success) {
      window.location.href = res.data.authorization_url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (isSignup) {
      if (password !== confirmPassword) {
        setLoginError("비밀번호가 일치하지 않습니다.");
        return;
      }
      setLoginError("회원가입 문의: ys1014@hanyang.ac.kr");
      return;
    }

    const expected = CREDENTIALS[email.trim().toLowerCase()];
    if (!expected || password !== expected) {
      setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.devLogin(email.trim().toLowerCase());
      if (res.success) {
        await login(res.data.access_token, res.data.refresh_token);
        router.push("/editor");
      } else {
        setLoginError("로그인에 실패했습니다.");
      }
    } catch {
      setLoginError("서버에 연결할 수 없습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left: floating balls */}
      <motion.div
        className="relative overflow-hidden md:w-1/2 min-h-[220px] shrink-0"
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #1a1d3a 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Grid overlay — dynamic bg values can't be Tailwind */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating balls — dynamic positions/sizes need style */}
        {BALLS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[1px]"
            style={{
              width: b.size,
              height: b.size,
              background: b.color,
              left: b.x,
              top: b.y,
              boxShadow: `0 0 ${b.size * 0.6}px ${b.color}`,
            }}
            animate={{
              y: [0, -30, 10, -20, 0],
              x: [0, 10, -15, 5, 0],
              scale: [1, 1.05, 0.95, 1.02, 1],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
              Aㅏ소서
            </h1>
            <p className="text-xs text-slate-400/60 tracking-widest">
              AI 자기소개서 첨삭 플랫폼
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right: login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-0 md:pt-20 bg-[#f5f6fa]">
        <motion.div
          className="w-full max-w-90"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.34, 1.1, 0.64, 1] }}
        >
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-[#1a1d27] mb-1.5 -tracking-wide">
              {isSignup ? "회원가입" : "로그인"}
            </h2>
            <p className="text-sm text-[#8892a4]">
              {isSignup ? "새 계정을 만들어 시작하세요." : "AI 자소서 첨삭 서비스에 오신 것을 환영합니다."}
            </p>
          </div>

          <AnimatePresence>
            {loginError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 pl-0.5 mb-3"
              >
                {loginError}
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#e2e6ef] bg-white text-[#1a1d27] text-sm outline-none transition-colors focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-[10px] border-[1.5px] border-[#e2e6ef] bg-white text-[#1a1d27] text-sm outline-none transition-colors focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0 bg-transparent border-none cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                    className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#e2e6ef] bg-white text-[#1a1d27] text-sm outline-none transition-colors focus:border-indigo-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !email || !password}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-2.5 rounded-[10px] text-sm font-medium text-white tracking-wide mt-1 flex items-center justify-center gap-2 border-none cursor-pointer disabled:cursor-not-allowed ${loading ? "bg-gray-400" : "bg-[#1a1d27] hover:bg-[#2a2d37]"
                }`}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {isSignup ? "처리 중..." : "로그인 중..."}
                </>
              ) : isSignup ? "회원가입" : "로그인"}
            </motion.button>
          </form>

          {/* 소셜 로그인 */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#e2e6ef]" />
              <span className="text-xs text-[#b0b8cc]">또는</span>
              <div className="flex-1 h-px bg-[#e2e6ef]" />
            </div>
            <div className="flex justify-center gap-4">
              {/* 카카오 */}
              <motion.button
                type="button"
                onClick={() => handleOAuthLogin("kakao")}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-[#FEE500] border-none cursor-pointer flex items-center justify-center"
              >
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 1.5C4.858 1.5 1.5 4.134 1.5 7.383c0 2.088 1.371 3.918 3.447 4.965l-.877 3.27a.188.188 0 0 0 .288.201l3.813-2.516A9.82 9.82 0 0 0 9 13.266c4.142 0 7.5-2.634 7.5-5.883C16.5 4.134 13.142 1.5 9 1.5z" fill="#191919" />
                </svg>
              </motion.button>
              {/* 네이버 (미구현) */}
              {/* <motion.button
                type="button"
                onClick={() => handleOAuthLogin("naver")}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-[#03C75A] border-none cursor-pointer flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M13.56 10.5L6.15 0H0v20h6.44V9.5L13.85 20H20V0h-6.44v10.5z" fill="#fff" />
                </svg>
              </motion.button> */}
              {/* 구글 */}
              <motion.button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-white border-[1.5px] border-[#e2e6ef] cursor-pointer flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* 로그인/회원가입 전환 */}
          <div className="text-center mt-5 text-sm text-[#8892a4]">
            {isSignup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setLoginError(null); }}
              className="bg-transparent border-none cursor-pointer text-indigo-500 font-medium hover:underline"
            >
              {isSignup ? "로그인" : "회원가입"}
            </button>
          </div>

          <p className="text-center text-xs text-[#b0b8cc] mt-5 leading-relaxed">
            문의:{" "}
            <a href="mailto:ys1014@hanyang.ac.kr" className="text-indigo-500 no-underline hover:underline">
              ys1014@hanyang.ac.kr
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
