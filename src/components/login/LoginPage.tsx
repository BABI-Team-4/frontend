"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X, ChevronRight } from "lucide-react";

const BALLS = [
  { size: 120, x: "15%", y: "20%", color: "rgba(99,102,241,0.35)", duration: 7, delay: 0 },
  { size: 80, x: "60%", y: "10%", color: "rgba(59,130,246,0.4)", duration: 9, delay: 1 },
  { size: 160, x: "75%", y: "55%", color: "rgba(99,102,241,0.2)", duration: 11, delay: 0.5 },
  { size: 60, x: "30%", y: "65%", color: "rgba(147,197,253,0.5)", duration: 8, delay: 2 },
  { size: 100, x: "50%", y: "80%", color: "rgba(59,130,246,0.25)", duration: 10, delay: 1.5 },
  { size: 50, x: "85%", y: "25%", color: "rgba(165,180,252,0.5)", duration: 6, delay: 0.8 },
  { size: 90, x: "10%", y: "80%", color: "rgba(96,165,250,0.3)", duration: 12, delay: 3 },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(error);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [termsModal, setTermsModal] = useState<"terms" | "privacy" | null>(null);

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
    setLoading(true);

    try {
      if (isSignup) {
        if (password !== confirmPassword) {
          setLoginError("비밀번호가 일치하지 않습니다.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setLoginError("비밀번호는 6자 이상이어야 합니다.");
          setLoading(false);
          return;
        }
        if (!agreeTerms || !agreePrivacy) {
          setLoginError("이용약관과 개인정보처리방침에 동의해주세요.");
          setLoading(false);
          return;
        }
        const res = await authApi.signup(email.trim(), password, name.trim());
        if (res.success) {
          await login(res.data.access_token, res.data.refresh_token);
          router.push("/editor");
        } else {
          setLoginError(res.error?.message || "회원가입에 실패했습니다.");
        }
      } else {
        const res = await authApi.emailLogin(email.trim(), password);
        if (res.success) {
          await login(res.data.access_token, res.data.refresh_token);
          router.push("/editor");
        } else {
          setLoginError(res.error?.message || "이메일 또는 비밀번호가 올바르지 않습니다.");
        }
      }
    } catch {
      setLoginError("서버에 연결할 수 없습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[var(--app-viewport-height)]">
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
              {isSignup ? "새 계정을 만들어 시작하세요." : "자소서 첨삭 서비스에 오신 것을 환영합니다."}
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
            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#e2e6ef] bg-white text-[#1a1d27] text-sm outline-none transition-colors focus:border-indigo-500"
                  />
                </motion.div>
              )}
            </AnimatePresence>

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

            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreeTerms && agreePrivacy}
                      onChange={(e) => { setAgreeTerms(e.target.checked); setAgreePrivacy(e.target.checked); }}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                    <span className="text-xs font-medium text-[#1a1d27]">전체 동의</span>
                  </label>
                  <div className="ml-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-indigo-500"
                        />
                        <span className="text-xs text-[#8892a4]">[필수] 이용약관 동의</span>
                      </label>
                      <button type="button" onClick={() => setTermsModal("terms")} className="text-xs text-indigo-400 hover:text-indigo-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5">
                        보기 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={(e) => setAgreePrivacy(e.target.checked)}
                          className="w-3.5 h-3.5 rounded accent-indigo-500"
                        />
                        <span className="text-xs text-[#8892a4]">[필수] 개인정보처리방침 동의</span>
                      </label>
                      <button type="button" onClick={() => setTermsModal("privacy")} className="text-xs text-indigo-400 hover:text-indigo-600 bg-transparent border-none cursor-pointer flex items-center gap-0.5">
                        보기 <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !email || !password || (isSignup && (!agreeTerms || !agreePrivacy))}
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

      {/* 약관 모달 */}
      <AnimatePresence>
        {termsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setTermsModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e6ef] flex-shrink-0">
                <h3 className="text-base font-bold text-[#1a1d27]">
                  {termsModal === "terms" ? "이용약관" : "개인정보처리방침"}
                </h3>
                <button onClick={() => setTermsModal(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 bg-transparent border-none cursor-pointer">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-7 text-[#444] space-y-5">
                {termsModal === "terms" ? <TermsContent /> : <PrivacyContent />}
              </div>
              <div className="px-6 py-3 border-t border-[#e2e6ef] flex-shrink-0">
                <button
                  onClick={() => {
                    if (termsModal === "terms") setAgreeTerms(true);
                    else setAgreePrivacy(true);
                    setTermsModal(null);
                  }}
                  className="w-full py-2.5 rounded-[10px] text-sm font-medium text-white bg-[#1a1d27] hover:bg-[#2a2d37] border-none cursor-pointer"
                >
                  동의하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TermsContent() {
  return (
    <>
      <p className="text-xs text-[#999]">시행일: 2026년 1월 1일</p>
      <Section title="제1조 (목적)">
        이 약관은 자소서AI(이하 &quot;회사&quot;)가 제공하는 AI 자기소개서 첨삭 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
      </Section>
      <Section title="제2조 (정의)">
        ① &quot;서비스&quot;란 회사가 제공하는 AI 기반 자기소개서 첨삭, 합격 자소서 유사도 분석, 컨설팅 등 일체의 서비스를 말합니다.{"\n"}
        ② &quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.{"\n"}
        ③ &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서, 서비스를 지속적으로 이용할 수 있는 자를 말합니다.{"\n"}
        ④ &quot;크레딧&quot;이란 서비스 내에서 AI 첨삭 기능을 이용하기 위한 가상의 포인트를 말합니다.
      </Section>
      <Section title="제3조 (약관의 효력 및 변경)">
        ① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.{"\n"}
        ② 회사는 합리적인 사유가 발생한 경우 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.{"\n"}
        ③ 약관이 변경되는 경우 회사는 변경 사항을 시행일 7일 전부터 서비스 내 공지합니다.
      </Section>
      <Section title="제4조 (서비스의 제공)">
        회사는 다음과 같은 서비스를 제공합니다.{"\n"}
        • AI 기반 자기소개서 실시간 첨삭 서비스{"\n"}
        • 합격 자소서 유사도 분석 서비스{"\n"}
        • 직무·기업별 맞춤 키워드 제안 서비스{"\n"}
        • 첨삭 전후 비교 및 점수 평가 서비스
      </Section>
      <Section title="제5조 (크레딧 정책)">
        ① 무료 회원은 매월 1일 30크레딧을 무상으로 지급받습니다.{"\n"}
        ② AI 첨삭 1회 이용 시 1크레딧이 차감됩니다.{"\n"}
        ③ 미사용 크레딧은 다음 달로 이월되지 않으며 매월 초기화됩니다.
      </Section>
      <Section title="제6조 (회원가입 및 관리)">
        ① 이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 이 약관에 동의함으로써 회원가입을 신청합니다.{"\n"}
        ② 허위 정보를 기재하거나 타인의 명의를 이용한 경우 승낙이 거부될 수 있습니다.
      </Section>
      <Section title="제7조 (이용자의 의무)">
        이용자는 다음 행위를 해서는 안 됩니다.{"\n"}
        • 타인의 정보를 도용하거나 허위 정보를 등록하는 행위{"\n"}
        • 회사 및 제3자의 저작권 등 지적재산권을 침해하는 행위{"\n"}
        • 서비스를 통해 얻은 정보를 무단으로 복제, 유통, 판매하는 행위
      </Section>
      <Section title="제8조 (면책조항)">
        ① AI 첨삭 서비스는 참고용으로 제공되며, 실제 채용 결과에 대해 회사는 책임을 지지 않습니다.{"\n"}
        ② 천재지변 등 불가항력으로 인한 서비스 중단 시 책임이 면제됩니다.
      </Section>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="text-xs text-[#999]">시행일: 2026년 1월 1일</p>
      <Section title="제1조 (수집하는 개인정보 항목)">
        회사는 서비스 제공을 위해 다음 개인정보를 수집합니다.{"\n"}
        • 필수항목: 이메일, 이름(또는 닉네임){"\n"}
        • 소셜 로그인 시: 프로필 이미지, 소셜 계정 식별자{"\n"}
        • 서비스 이용 과정에서 자동 수집: 접속 일시, 이용 기록, 기기 정보
      </Section>
      <Section title="제2조 (개인정보의 수집 및 이용 목적)">
        • 회원 가입 및 관리: 본인 식별, 가입 의사 확인{"\n"}
        • 서비스 제공: AI 첨삭, 유사도 분석 등 핵심 기능 제공{"\n"}
        • 서비스 개선: 이용 통계 분석, 서비스 품질 향상
      </Section>
      <Section title="제3조 (개인정보의 보유 및 이용 기간)">
        • 회원 탈퇴 시 지체 없이 파기합니다.{"\n"}
        • 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.{"\n"}
        • 계약 또는 청약 철회 기록: 5년 / 로그인 기록: 3개월
      </Section>
      <Section title="제4조 (개인정보의 제3자 제공)">
        회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.
      </Section>
      <Section title="제5조 (개인정보의 파기)">
        보유 기간이 경과하거나 처리 목적이 달성된 경우, 전자적 파일은 복구할 수 없는 방법으로, 종이 문서는 분쇄 또는 소각하여 파기합니다.
      </Section>
      <Section title="제6조 (이용자의 자기소개서 데이터)">
        • 이용자가 입력한 자기소개서는 첨삭 서비스 제공 목적으로만 사용됩니다.{"\n"}
        • 서비스 품질 개선을 위해 비식별화 처리 후 AI 모델 학습에 활용될 수 있습니다.{"\n"}
        • 이용자는 언제든지 자신의 데이터 삭제를 요청할 수 있습니다.
      </Section>
      <Section title="제7조 (이용자의 권리)">
        이용자는 언제든지 자신의 개인정보 열람, 수정, 삭제를 요청할 수 있으며, 회사는 지체 없이 조치합니다.
      </Section>
      <Section title="제8조 (개인정보 보호책임자)">
        성명: 신윤수{"\n"}
        이메일: ys1014@hanyang.ac.kr
      </Section>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-[#1a1d27] mb-1.5">{title}</h4>
      <p className="text-sm leading-7 text-[#555] whitespace-pre-line">{children}</p>
    </div>
  );
}
