"use client";

import { FileText, ArrowLeft, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ParsedQuestion {
  question: string;
  answer: string;
}

interface SplitStepProps {
  docTitle: string;
  setDocTitle: (v: string) => void;
  parsedQuestions: ParsedQuestion[];
  setParsedQuestions: (v: ParsedQuestion[]) => void;
  isParsing: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function SplitStep({
  docTitle, setDocTitle, parsedQuestions, setParsedQuestions, isParsing, onBack, onNext,
}: SplitStepProps) {
  const updateQuestion = (i: number, patch: Partial<ParsedQuestion>) => {
    const u = [...parsedQuestions];
    u[i] = { ...u[i], ...patch };
    setParsedQuestions(u);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="h-auto border-none p-0 text-sm font-semibold shadow-none focus-visible:ring-0 min-w-[80px]"
            />
          </div>
        </div>
        {!isParsing && (
          <Button onClick={onNext} size="sm" className="rounded-full gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 첨삭 시작
          </Button>
        )}
      </div>

      {isParsing ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-500"
                style={{ animation: `blink 1.3s ease-in-out ${i * 0.18}s infinite` }}
              />
            ))}
          </div>
          <p className="text-sm text-neutral-400">AI가 문항을 분석하는 중...</p>
          <style>{`@keyframes blink{0%,100%{opacity:0.25;}50%{opacity:1;}}`}</style>
        </div>
      ) : (
        <div className="flex-1 flex min-h-0">
          {/* 편집 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:border-r border-neutral-200 bg-neutral-50" style={{ minWidth: 0 }}>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">편집</p>
            {parsedQuestions.map((q, i) => (
              <div key={i} className="rounded-lg bg-white border border-neutral-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 bg-neutral-50">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(i, { question: e.target.value })}
                    className="h-auto border-none p-0 text-xs font-semibold shadow-none focus-visible:ring-0"
                  />
                </div>
                <Textarea
                  value={q.answer}
                  onChange={(e) => updateQuestion(i, { answer: e.target.value })}
                  className="border-none rounded-none shadow-none focus-visible:ring-0 px-4 py-3 text-sm text-neutral-700 leading-relaxed"
                  style={{ minHeight: 120, resize: "vertical" }}
                />
              </div>
            ))}
          </div>

          {/* 미리보기 */}
          <div className="hidden md:block flex-1 overflow-y-auto p-6 bg-white" style={{ minWidth: 0 }}>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-4">미리보기</p>
            <div className="space-y-6">
              {parsedQuestions.map((q, i) => (
                <div key={i}>
                  <h3 className="text-sm font-bold text-black mb-2">{i + 1}. {q.question}</h3>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">{q.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
