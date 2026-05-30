"use client";

import { motion } from "framer-motion";
import { Sparkles, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PasteStepProps {
  docTitle: string;
  setDocTitle: (v: string) => void;
  coverLetter: string;
  setCoverLetter: (v: string) => void;
  onNext: () => void;
}

export default function PasteStep({ docTitle, setDocTitle, coverLetter, setCoverLetter, onNext }: PasteStepProps) {
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 bg-neutral-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 bg-neutral-100 text-neutral-600">
            <Sparkles className="w-3 h-3" /> AI 자소서 첨삭
          </div>
          <h1 className="text-2xl font-bold mb-2 text-black">자소서를 붙여넣어 주세요</h1>
          <p className="text-sm text-neutral-500">AI가 구체성·차별화·직무 연관성을 즉시 분석합니다</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3 pb-2.5 border-b border-neutral-100">
            <FileText className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="h-auto border-none rounded-none p-0 text-sm font-semibold shadow-none focus-visible:ring-0"
            />
          </div>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="여기에 자소서 내용을 붙여넣으세요..."
            className="border-none rounded-none shadow-none focus-visible:ring-0 px-4 py-4 text-sm leading-relaxed"
            style={{ height: 260, resize: "none" }}
          />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-100">
            <span className="text-xs font-mono text-neutral-400">
              {coverLetter.trim().length > 0 ? `${coverLetter.trim().length.toLocaleString()}자` : "0자"}
            </span>
            <Button
              onClick={onNext}
              disabled={!coverLetter.trim()}
              size="sm"
              className="rounded-full gap-1.5"
            >
              다음 <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs mt-4 text-neutral-400">
          Ctrl+V 로 붙여넣기 · 여러 문항을 한 번에 넣어도 됩니다
        </p>
      </div>
    </motion.div>
  );
}
