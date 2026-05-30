"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Building2, Calendar, Briefcase,
  GraduationCap, BookOpen, Copy, Check, Loader2,
} from "lucide-react";
import { library, type LibraryEssayDetail } from "@/lib/api";
import { useCopy } from "@/lib/hooks";

const ORG_LABELS: Record<string, string> = { corp: "기업", bank: "금융", public: "공기업" };

function OrgBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    corp: { bg: "#eff6ff", text: "#2563eb" },
    bank: { bg: "#fef3c7", text: "#d97706" },
    public: { bg: "#ecfdf5", text: "#059669" },
  };
  const s = map[type] ?? { bg: "#f5f5f5", text: "#737373" };
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ background: s.bg, color: s.text }}>
      {ORG_LABELS[type] ?? type}
    </span>
  );
}

function QnaCard({ qna, idx }: { qna: LibraryEssayDetail["qna"][number]; idx: number }) {
  const { copied, copy } = useCopy();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.25 }}
      className="border border-neutral-200 rounded-xl bg-white overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono font-semibold text-blue-500 flex-shrink-0">Q{idx + 1}</span>
          <p className="text-sm font-semibold text-neutral-700 truncate">{qna.question}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {qna.question_type && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-400">{qna.question_type}</span>
          )}
          <span className="text-[11px] font-mono text-neutral-300">{qna.char_count.toLocaleString()}자</span>
          <button
            onClick={() => copy(qna.answer)}
            className="text-[11px] text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "복사됨" : "복사"}
          </button>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-600">{qna.answer}</p>
      </div>
    </motion.div>
  );
}

export default function LibraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const essayId = Number(params.id);
  const invalidEssayId = Number.isNaN(essayId);

  const [data, setData] = useState<LibraryEssayDetail | null>(null);
  const [loading, setLoading] = useState(!invalidEssayId);

  useEffect(() => {
    if (invalidEssayId) return;
    library.get(essayId).then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [essayId, invalidEssayId]);

  if (loading) {
    return (
      <div className="flex h-[var(--app-viewport-height)] items-center justify-center">
        <Loader2 className="w-5 h-5 text-neutral-300 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[var(--app-viewport-height)] items-center justify-center flex-col gap-3">
        <p className="text-sm text-neutral-500">자소서를 찾을 수 없습니다</p>
        <button onClick={() => router.push("/library")} className="text-xs text-blue-500 hover:underline">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[var(--app-viewport-height)] bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="max-w-[860px] mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/library")}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-500" />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building2 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <h1 className="text-sm font-bold text-black truncate">{data.company}</h1>
            <span className="text-xs text-neutral-400 flex-shrink-0">{data.role}</span>
            <OrgBadge type={data.org_type} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[860px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-400 mb-6">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{data.year} {data.season}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{data.hire_type}</span>
          {data.university && <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{data.university}{data.major ? ` · ${data.major}` : ""}</span>}
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{data.qna.length}개 문항</span>
        </div>

        {/* QnA */}
        <div className="space-y-4">
          {data.qna.map((q, i) => (
            <QnaCard key={q.qna_id} qna={q} idx={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
