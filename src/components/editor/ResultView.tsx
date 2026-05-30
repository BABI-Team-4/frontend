"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, ArrowLeft, CheckCircle2, XCircle,
  Copy, Check, Loader2, ClipboardList, RefreshCw, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useCopy } from "@/lib/hooks";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ParsedQuestion {
  question: string;
  answer: string;
}

export interface ConItem {
  point: string;
  reason: string;
  suggestion: string;
}

export interface AdviseResult {
  draft: string;
  summary: string;
  pros: string[];
  cons: ConItem[];
  rewrite: string;
  input_chars: number;
  rewrite_chars: number;
  avg_ref_chars: number;
  references: {
    essay_id: number;
    qna_id: number;
    company: string;
    role: string;
    question: string;
    answer: string;
    similarity: number;
    char_count: number;
  }[];
  ref_warning: boolean;
  tokens_used: number;
}

/* ── 좌측: 문항 카드 (원문 + 수정안) ── */
function QuestionCard({
  idx,
  question,
  result,
  editedRewrites,
  onEditRewrite,
  isActive,
  onClick,
  onRetry,
  onInView,
}: {
  idx: number;
  question: ParsedQuestion;
  result: AdviseResult | null | "failed";
  editedRewrites: Record<number, string>;
  onEditRewrite: (idx: number, text: string) => void;
  isActive: boolean;
  onClick: () => void;
  onRetry?: () => void;
  onInView?: () => void;
}) {
  const rewriteText = editedRewrites[idx] ?? (result && result !== "failed" ? result.rewrite : "") ?? "";
  const { copied, copy } = useCopy();
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { margin: "-40% 0px -40% 0px", once: false });

  useEffect(() => {
    if (isInView && onInView) onInView();
  }, [isInView, onInView]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.3 }}
      className="mb-8"
    >
      <button
        onClick={onClick}
        className={`flex items-baseline gap-3 mb-3 w-full text-left rounded-md px-2 py-1.5 -mx-2 transition-colors ${isActive ? "bg-blue-50" : "hover:bg-neutral-50"
          }`}
      >
        <span className={`text-xs font-mono font-semibold ${isActive ? "text-blue-500" : "text-neutral-400"}`}>
          Q{idx + 1}
        </span>
        <p className="text-sm font-semibold text-neutral-700">{question.question}</p>
      </button>

      {/* 원문 */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white mb-2">
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 bg-neutral-50/80">
          <span className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">원문</span>
          {result && result !== "failed" && <span className="text-[11px] font-mono text-neutral-300">{result.input_chars.toLocaleString()}자</span>}
        </div>
        <div className="px-4 py-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-500 line-through decoration-neutral-300">
            {question.answer}
          </p>
        </div>
      </div>

      {/* 수정안 */}
      {result === null ? (
        <div className="border border-blue-100 rounded-lg bg-blue-50/50 px-4 py-6 flex items-center justify-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin" />
          <span className="text-xs text-blue-300">분석 중...</span>
        </div>
      ) : result === "failed" ? (
        <div className="border border-red-100 rounded-lg bg-red-50/50 px-4 py-6 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-300" />
          <span className="text-xs text-red-400">첨삭에 실패했습니다</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#2563eb" }}
            >
              <RefreshCw className="w-3 h-3" />
              재첨삭
            </button>
          )}
        </div>
      ) : result.rewrite ? (
        <div className="border border-blue-200 rounded-lg overflow-hidden" style={{ background: "#f0f7ff" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-blue-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-[11px] font-semibold text-blue-400 tracking-wider uppercase">수정안</span>
              {result.avg_ref_chars > 0 && (
                <span className="text-[11px] font-mono text-blue-300">합격 평균 {result.avg_ref_chars.toLocaleString()}자</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-blue-300">{result.rewrite_chars.toLocaleString()}자</span>
              <button onClick={() => copy(rewriteText)} className="text-[11px] text-blue-400 hover:text-blue-600 flex items-center gap-1 transition-colors">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
          </div>
          <div className="px-4 py-4">
            {isEditing ? (
              <Textarea
                value={rewriteText}
                autoFocus
                onChange={(e) => onEditRewrite(idx, e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 p-0 text-sm text-blue-900 leading-relaxed bg-transparent resize-none"
                style={{ minHeight: 120 }}
              />
            ) : (
              <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{rewriteText}</p>
            )}
          </div>
          <div className="px-4 pb-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs px-3 py-1.5 rounded border border-blue-200 text-blue-500 hover:bg-blue-100 transition-colors"
            >
              {isEditing ? "완료" : "수정하기"}
            </button>
          </div>
        </div>
      ) : null}

      {idx < 99 && <div className="mt-8 border-b border-neutral-100" />}
    </motion.div>
  );
}

/* ── 우측: 분석 사이드바 (문항별) ── */
function AnalysisSection({
  idx,
  result,
  onRefClick,
}: {
  idx: number;
  result: AdviseResult | null | "failed";
  onRefClick?: (ref: Reference) => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-xs font-mono font-semibold text-neutral-400">Q{idx + 1}</span>
        <div className="flex-1 border-b border-neutral-100" />
      </div>

      {result === "failed" ? (
        <div className="border border-red-100 rounded-lg bg-red-50/50 px-4 py-4 flex items-center justify-center">
          <span className="text-xs text-red-300">분석 실패</span>
        </div>
      ) : result === null ? (
        <div className="border border-neutral-100 rounded-lg bg-neutral-50 px-4 py-8 flex items-center justify-center">
          <Loader2 className="w-3.5 h-3.5 text-neutral-300 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {result.summary && (
            <div className="border border-neutral-200 rounded-lg px-3 py-2.5 bg-white">
              <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">총평</p>
              <p className="text-xs text-neutral-600 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {(result.pros.length > 0 || result.cons.length > 0) && (
            <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">AI 첨삭</p>
              </div>
              <div className="px-3 pb-2.5 space-y-1.5">
                {result.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-1" />
                    <span className="text-xs text-neutral-600 leading-relaxed">{p}</span>
                  </div>
                ))}
                {result.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-2" />
                    <div>
                      <span className="text-xs font-semibold text-neutral-600">{c.point}</span>
                      <p className="text-xs text-neutral-400 leading-relaxed">{c.reason}</p>
                      <p className="text-xs text-blue-400 leading-relaxed">→ {c.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.references.length > 0 && (
            <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
              <div className="px-3 pt-2.5 pb-2">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">유사 합격 자소서</p>
                <div className="space-y-2">
                  {result.references.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => onRefClick?.(r)}
                      className="flex items-center gap-2 w-full text-left rounded-md px-1 py-1 -mx-1 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded bg-neutral-100 text-[9px] font-bold text-neutral-500 flex items-center justify-center flex-shrink-0">
                        {r.company.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-neutral-700 truncate">{r.company}{r.role ? ` · ${r.role}` : ""}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{r.answer}</p>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-blue-400 flex-shrink-0">
                        {(r.similarity * 100).toFixed(0)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Reference = AdviseResult["references"][number];

function ReferenceModal({ reference: r, open, onClose }: { reference: Reference | null; open: boolean; onClose: () => void }) {
  const { copied, copy } = useCopy();
  if (!r) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col rounded-xl border-none shadow-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-3 border-b border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-[10px] font-bold text-neutral-500 flex items-center justify-center flex-shrink-0">
              {r.company.slice(0, 2)}
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-black">
                {r.company}{r.role ? ` · ${r.role}` : ""}
              </DialogTitle>
            </div>
            <span className="ml-auto text-xs font-mono font-semibold text-blue-500">
              유사도 {(r.similarity * 100).toFixed(0)}%
            </span>
          </div>
          {r.question && (
            <p className="text-xs text-neutral-400 mt-1">{r.question}</p>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-700">{r.answer}</p>
        </div>
        <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] font-mono text-neutral-300">{r.char_count.toLocaleString()}자</span>
          <div className="flex items-center gap-2">
            {r.essay_id ? (
              <Link
                href={`/library/${r.essay_id}`}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-blue-500 hover:bg-blue-50 transition-colors"
              >
                전체 자소서 보기
              </Link>
            ) : (
              <Link
                href={`/library?keyword=${encodeURIComponent(r.company)}`}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-blue-500 hover:bg-blue-50 transition-colors"
              >
                전체 자소서 보기
              </Link>
            )}
            <button
              onClick={() => copy(r.answer)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ResultViewProps {
  parsedQuestions: ParsedQuestion[];
  adviseResults: (AdviseResult | null | "failed")[];
  company: string;
  position: string;
  onBack: () => void;
  onRetry?: (idx: number) => void;
}

export default function ResultView({
  parsedQuestions,
  adviseResults,
  company,
  position,
  onBack,
  onRetry,
}: ResultViewProps) {
  const [editedRewrites, setEditedRewrites] = useState<Record<number, string>>({});
  const [activeQ, setActiveQ] = useState(0);
  const [selectedRef, setSelectedRef] = useState<Reference | null>(null);
  const { copied: allCopied, copy: copyAll } = useCopy();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setSectionRef = useCallback((idx: number) => (el: HTMLDivElement | null) => {
    sectionRefs.current[idx] = el;
  }, []);

  const handleEditRewrite = (idx: number, text: string) => {
    setEditedRewrites((prev) => ({ ...prev, [idx]: text }));
  };

  const scrollSidebarTo = useCallback((idx: number) => {
    const target = sectionRefs.current[idx];
    if (target && sidebarRef.current) {
      sidebarRef.current.scrollTo({
        top: target.offsetTop - sidebarRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  }, []);

  const handleClickQuestion = (idx: number) => {
    setActiveQ(idx);
    scrollSidebarTo(idx);
  };

  const handleInView = useCallback((idx: number) => {
    setActiveQ(idx);
    scrollSidebarTo(idx);
  }, [scrollSidebarTo]);

  const handleCopyAll = () => {
    const parts = parsedQuestions.map((q, i) => {
      const result = adviseResults[i];
      const rewrite = editedRewrites[i] ?? (result && result !== "failed" ? result.rewrite : null) ?? q.answer;
      return parsedQuestions.length > 1
        ? `[${q.question}]\n${rewrite}`
        : rewrite;
    });
    copyAll(parts.join("\n\n"));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <style>{`
        @keyframes blink{0%,100%{opacity:0.25;transform:scale(0.85);}50%{opacity:1;transform:scale(1);}}
        .tdot{animation:blink 1.3s ease-in-out infinite;}
        .tdot:nth-child(2){animation-delay:0.18s;}
        .tdot:nth-child(3){animation-delay:0.36s;}
      `}</style>

      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-neutral-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-black leading-tight">{company || "새 자소서"}</h1>
            {position && <p className="text-xs text-neutral-400">{position}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-all"
            style={{
              border: allCopied ? "1px solid #10b981" : "1px solid #e5e5e5",
              color: allCopied ? "#10b981" : "#737373",
              background: allCopied ? "#f0fdf4" : "white",
            }}
          >
            {allCopied ? <Check className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
            {allCopied ? "복사됨" : "전체 복사"}
          </button>
        </div>
      </div>

      {/* 본문: 2컬럼 */}
      <div className="flex-1 flex min-h-0">
        {/* 좌측: 문항별 원문 + 수정안 */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 min-w-0">
          <div className="max-w-[720px] mx-auto px-4 md:px-6 py-6 md:py-8">
            {parsedQuestions.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => <div key={i} className="tdot w-2 h-2 rounded-full bg-neutral-300" />)}
                </div>
              </div>
            ) : (
              parsedQuestions.map((q, i) => (
                <QuestionCard
                  key={i}
                  idx={i}
                  question={q}
                  result={adviseResults[i] ?? null}
                  editedRewrites={editedRewrites}
                  onEditRewrite={handleEditRewrite}
                  isActive={activeQ === i}
                  onClick={() => handleClickQuestion(i)}
                  onRetry={onRetry ? () => onRetry(i) : undefined}
                  onInView={() => handleInView(i)}
                />
              ))
            )}
          </div>
        </div>

        {/* 우측: 분석 사이드바 */}
        <div
          ref={sidebarRef}
          className="hidden lg:block w-[320px] flex-shrink-0 border-l border-neutral-200 bg-white overflow-y-auto"
        >
          <div className="px-4 py-6">
            {parsedQuestions.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-4 h-4 text-neutral-300 animate-spin" />
              </div>
            ) : (
              parsedQuestions.map((_, i) => (
                <div key={i} ref={setSectionRef(i)}>
                  <AnalysisSection
                    idx={i}
                    result={adviseResults[i] ?? null}
                    onRefClick={setSelectedRef}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ReferenceModal
        reference={selectedRef}
        open={!!selectedRef}
        onClose={() => setSelectedRef(null)}
      />
    </div>
  );
}
