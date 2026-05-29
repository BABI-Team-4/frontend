"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

const SECTIONS = [
  {
    title: "제1조 (목적)",
    content: `이 약관은 자소서AI(이하 "회사")가 제공하는 AI 자기소개서 첨삭 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: "제2조 (정의)",
    content: `① "서비스"란 회사가 제공하는 AI 기반 자기소개서 첨삭, 합격 자소서 유사도 분석, 컨설팅 등 일체의 서비스를 말합니다.\n② "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.\n③ "회원"이란 회사에 개인정보를 제공하여 회원 등록을 한 자로서, 회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.\n④ "크레딧"이란 서비스 내에서 AI 첨삭 기능을 이용하기 위한 가상의 포인트를 말합니다.`,
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    content: `① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.\n② 회사는 합리적인 사유가 발생한 경우 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.\n③ 약관이 변경되는 경우 회사는 변경 사항을 시행일 7일 전부터 서비스 내 공지합니다.`,
  },
  {
    title: "제4조 (서비스의 제공)",
    content: `① 회사는 다음과 같은 서비스를 제공합니다.\n  - AI 기반 자기소개서 실시간 첨삭 서비스\n  - 합격 자소서 유사도 분석 서비스\n  - 직무·기업별 맞춤 키워드 제안 서비스\n  - 첨삭 전후 비교 및 점수 평가 서비스\n  - 기타 회사가 정하는 서비스\n② 서비스는 연중무휴 1일 24시간 제공함을 원칙으로 합니다. 단, 시스템 점검, 장애 등의 사유로 일시 중단될 수 있습니다.`,
  },
  {
    title: "제5조 (크레딧 정책)",
    content: `① 무료 회원은 매월 1일 30크레딧을 무상으로 지급받습니다.\n② 크레딧은 AI 첨삭 1회 이용 시 1크레딧이 차감됩니다.\n③ 미사용 크레딧은 다음 달로 이월되지 않으며 매월 초기화됩니다.\n④ 유료 크레딧 구매는 별도 정책에 따르며, 구매한 크레딧의 유효기간은 구매일로부터 1년입니다.\n⑤ 환불은 미사용 유료 크레딧에 한하여 구매일로부터 7일 이내에 신청 가능합니다.`,
  },
  {
    title: "제6조 (회원가입 및 관리)",
    content: `① 이용자는 회사가 정한 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.\n② 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 하지 않을 수 있습니다.\n  - 실명이 아니거나 타인의 명의를 이용한 경우\n  - 허위 정보를 기재하거나 회사가 요구하는 정보를 제공하지 않은 경우\n  - 사회의 안녕질서 또는 미풍양속을 저해할 목적으로 신청한 경우`,
  },
  {
    title: "제7조 (개인정보 보호)",
    content: `① 회사는 이용자의 개인정보를 보호하기 위하여 개인정보 보호법 등 관련 법령을 준수합니다.\n② 개인정보의 수집·이용·제공 등에 관한 사항은 개인정보처리방침에 따릅니다.\n③ 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 경우는 예외로 합니다.`,
  },
  {
    title: "제8조 (이용자의 의무)",
    content: `이용자는 다음 각 호의 행위를 해서는 안 됩니다.\n  - 타인의 정보를 도용하거나 허위 정보를 등록하는 행위\n  - 회사가 게시한 정보를 무단으로 변경하거나 삭제하는 행위\n  - 회사 및 제3자의 저작권 등 지적재산권을 침해하는 행위\n  - 서비스를 통해 얻은 정보를 회사의 사전 승낙 없이 복제, 유통, 판매하는 행위\n  - 기타 불법적이거나 부당한 행위`,
  },
  {
    title: "제9조 (저작권)",
    content: `① 서비스에서 제공되는 합격 자소서, AI 첨삭 결과물 등의 저작권은 해당 내용을 작성한 이용자 또는 회사에 귀속됩니다.\n② 이용자가 서비스에 게시한 자기소개서의 저작권은 해당 이용자에게 있으며, 회사는 서비스 품질 개선 목적으로 비식별화하여 활용할 수 있습니다.`,
  },
  {
    title: "제10조 (면책조항)",
    content: `① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.\n② AI 첨삭 서비스는 참고용으로 제공되며, 실제 채용 결과에 대해 회사는 책임을 지지 않습니다.\n③ 이용자가 서비스에 게재한 정보, 자료, 사실의 신뢰도 및 정확성 등의 내용에 관해서는 책임을 지지 않습니다.`,
  },
  {
    title: "제11조 (분쟁해결)",
    content: `① 회사와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법 상의 관할법원에 제소합니다.\n② 회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.`,
  },
];

export default function TermsPage() {
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
          <h1 className="font-display text-4xl mb-3" style={{ color: "oklch(0.14 0.04 255)" }}>이용약관</h1>
          <p className="text-base" style={{ color: "oklch(0.52 0.02 264)" }}>
            자소서AI 서비스를 이용하시기 전에 아래 약관을 꼭 읽어주세요.
          </p>
        </div>

        {/* Notice box */}
        <div className="p-5 rounded-2xl mb-10 border-l-4" style={{ background: "oklch(0.96 0.02 264)", borderLeftColor: "oklch(0.48 0.22 264)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "oklch(0.35 0.05 264)" }}>
            본 약관은 자소서AI 서비스 이용과 관련된 기본적인 사항을 규정합니다.
            서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
            <strong> 특히 제5조(크레딧 정책), 제9조(저작권), 제10조(면책조항)</strong>을 주의 깊게 읽어주세요.
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
            문의사항은{" "}
            <a href="mailto:support@jasoseoai.kr" className="underline" style={{ color: "oklch(0.5 0.15 264)" }}>
              support@jasoseoai.kr
            </a>
            로 연락해주세요.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs" style={{ color: "oklch(0.6 0.02 264)" }}>
            <span>시행일: 2026년 1월 1일</span>
            <span>·</span>
            <Link href="/privacy" className="underline" style={{ color: "oklch(0.5 0.15 264)" }}>개인정보처리방침 보기</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
