"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    content: `자소서AI는 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.

【필수 항목】
• 소셜 로그인(카카오, 네이버, Google): 이름, 이메일 주소, 프로필 사진
• 이메일 가입: 이름, 이메일 주소, 암호화된 비밀번호

【서비스 이용 과정에서 자동 수집되는 정보】
• 서비스 이용 기록, 접속 로그, 접속 IP 주소
• 쿠키, 기기 정보(OS, 브라우저 유형)
• 자기소개서 작성 및 첨삭 이용 기록`,
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    content: `수집한 개인정보는 다음의 목적에 한하여 이용됩니다.

• 회원 식별 및 서비스 이용 관리
• AI 자기소개서 첨삭 서비스 제공
• 크레딧 관리 및 서비스 이용 내역 관리
• 서비스 품질 개선 및 신규 서비스 개발 (비식별화 처리 후 활용)
• 불법 이용 방지 및 서비스 보안 유지
• 서비스 관련 공지사항 전달`,
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    content: `자소서AI는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후 해당 정보를 지체 없이 파기합니다.

【예외 사항 — 관련 법령에 따른 보유】
• 계약 또는 청약철회에 관한 기록: 5년 (전자상거래법)
• 대금결제 및 재화 공급에 관한 기록: 5년 (전자상거래법)
• 소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)
• 접속에 관한 기록: 3개월 (통신비밀보호법)

【회원 탈퇴 시】
탈퇴일로부터 30일 이내 파기. 단, 법령 상 보존 의무가 있는 경우 해당 기간 보유 후 파기.`,
  },
  {
    title: "4. 개인정보의 제3자 제공",
    content: `자소서AI는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.

• 이용자가 사전에 동의한 경우
• 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우

【소셜 로그인 제공업체】
카카오, 네이버, Google로부터 아래 정보를 제공받습니다.
• 제공받는 항목: 이름, 이메일 주소, 프로필 이미지 URL
• 이용 목적: 회원 식별 및 서비스 로그인`,
  },
  {
    title: "5. 개인정보의 처리 위탁",
    content: `자소서AI는 서비스 향상을 위하여 아래와 같이 개인정보 처리를 위탁하고 있습니다.

• 수탁업체: Amazon Web Services, Inc. (AWS)
  - 위탁 업무: 서버 호스팅 및 데이터 보관
  - 보유 기간: 회원 탈퇴 시 또는 위탁 계약 종료 시까지

• 수탁업체: OpenAI / Anthropic (AI 처리)
  - 위탁 업무: AI 첨삭 기능 처리 (비식별화 후 전송)
  - 보유 기간: 처리 완료 즉시 파기 (보관 없음)`,
  },
  {
    title: "6. 이용자의 권리와 행사 방법",
    content: `이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.

• 개인정보 열람 요청
• 오류 등이 있을 경우 정정 요청
• 삭제 요청 (단, 법령에서 보유 의무가 있는 경우 제외)
• 처리 정지 요청

위 권리 행사는 서비스 내 [설정 → 개인정보 관리] 또는 이메일(support@jasoseoai.kr)로 신청하실 수 있으며, 10일 이내에 처리합니다.`,
  },
  {
    title: "7. 쿠키(Cookie) 운영",
    content: `자소서AI는 서비스 품질 향상을 위해 쿠키를 사용합니다.

【쿠키란?】
웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에게 보내는 작은 텍스트 파일입니다.

【사용 목적】
• 로그인 상태 유지
• 이용자 설정 및 환경 기억
• 서비스 이용 분석 (Google Analytics 등)

【거부 방법】
브라우저 설정 → '쿠키 허용 안 함' 선택. 단, 쿠키 거부 시 일부 서비스 이용에 제한이 있을 수 있습니다.`,
  },
  {
    title: "8. 개인정보의 안전성 확보 조치",
    content: `자소서AI는 개인정보 보호를 위하여 다음과 같은 기술적·관리적 조치를 취하고 있습니다.

• 비밀번호 암호화(bcrypt) 저장
• HTTPS/TLS를 통한 전송 구간 암호화
• 개인정보 접근 권한 최소화 및 접근 로그 관리
• 보안 취약점 정기 점검
• 내부 개인정보 취급자 교육 실시`,
  },
  {
    title: "9. 개인정보 보호책임자",
    content: `개인정보 처리에 관한 업무를 총괄하거나, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

• 성명: 자소서AI 개인정보 보호팀
• 이메일: privacy@jasoseoai.kr
• 연락처: 이메일로 문의해주세요 (평일 10:00 ~ 18:00)

개인정보 침해로 인한 신고나 상담은 아래 기관에도 문의하실 수 있습니다.
• 개인정보분쟁조정위원회: www.kopico.go.kr (1833-6972)
• 개인정보침해신고센터: privacy.kisa.or.kr (국번없이 118)`,
  },
  {
    title: "10. 개인정보처리방침의 변경",
    content: `이 개인정보처리방침은 법령·정책 또는 보안기술의 변경에 따라 내용이 추가·삭제 및 수정될 수 있습니다. 변경 시 시행 7일 전부터 서비스 공지사항을 통해 고지합니다.

• 현행 개인정보처리방침 시행일: 2026년 1월 1일`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(0.98 0.003 247)", fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b px-8 py-4 flex items-center justify-between" style={{ background: "white", borderColor: "oklch(0.9 0.01 264)" }}>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="flex items-center gap-1.5 text-sm hover:opacity-60 transition-opacity" style={{ color: "oklch(0.5 0.03 264)" }}>
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </button>
          </Link>
          <div className="w-px h-4" style={{ background: "oklch(0.88 0.01 264)" }} />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 264), oklch(0.68 0.15 220))" }}>
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display text-lg" style={{ color: "oklch(0.14 0.04 255)" }}>자소서AI</span>
          </div>
        </div>
        <span className="text-sm" style={{ color: "oklch(0.5 0.02 264)" }}>시행일: 2026년 1월 1일</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-12">
          <h1 className="font-display text-4xl mb-3" style={{ color: "oklch(0.14 0.04 255)" }}>개인정보처리방침</h1>
          <p className="text-base" style={{ color: "oklch(0.52 0.02 264)" }}>
            자소서AI는 이용자의 개인정보를 소중히 여기고 관련 법령을 준수합니다.
          </p>
        </div>

        {/* Notice box */}
        <div className="p-5 rounded-2xl mb-10 border-l-4" style={{ background: "oklch(0.96 0.04 160)", borderLeftColor: "oklch(0.52 0.18 160)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.3 0.08 160)" }}>
            자소서AI(이하 &quot;회사&quot;)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-bold mb-3" style={{ color: "oklch(0.18 0.04 255)" }}>
                {section.title}
              </h2>
              <div
                className="text-sm leading-8 whitespace-pre-line p-5 rounded-2xl border"
                style={{ color: "oklch(0.38 0.02 264)", background: "white", borderColor: "oklch(0.92 0.01 264)" }}
              >
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: "oklch(0.9 0.01 264)" }}>
          <p className="text-sm" style={{ color: "oklch(0.55 0.02 264)" }}>
            개인정보 관련 문의:{" "}
            <a href="mailto:privacy@jasoseoai.kr" className="underline" style={{ color: "oklch(0.5 0.15 264)" }}>
              privacy@jasoseoai.kr
            </a>
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ color: "oklch(0.6 0.02 264)" }}>
            <span>시행일: 2026년 1월 1일</span>
            <span>·</span>
            <Link href="/terms" className="underline" style={{ color: "oklch(0.5 0.15 264)" }}>이용약관 보기</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
