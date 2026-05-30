"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Loader2, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PasteStepProps {
  coverLetter: string;
  setCoverLetter: (v: string) => void;
  onNext: () => void;
  onFileSelect: (file: File) => Promise<void>;
  extractingFile: boolean;
}

export default function PasteStep({ coverLetter, setCoverLetter, onNext, onFileSelect, extractingFile }: PasteStepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 bg-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 bg-neutral-100 text-neutral-600">
            <Sparkles className="w-3 h-3" /> 자소서 첨삭
          </div>
          <h1 className="text-2xl font-bold mb-2 text-black">자소서를 붙여넣어 주세요</h1>
          <p className="text-sm text-neutral-500">AI가 구체성·차별화·직무 연관성을 즉시 분석합니다</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="여기에 자소서 내용을 붙여넣으세요..."
            className="border-none rounded-none shadow-none focus-visible:ring-0 px-4 py-4 text-sm leading-relaxed"
            style={{ height: 260, resize: "none" }}
          />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400">
                {coverLetter.trim().length > 0 ? `${coverLetter.trim().length.toLocaleString()}자` : "0자"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.docx,.pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await onFileSelect(file);
                  e.currentTarget.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={extractingFile}
                className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {extractingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Paperclip className="w-3.5 h-3.5" />}
                파일 업로드
              </button>
            </div>
            <Button
              onClick={onNext}
              disabled={!coverLetter.trim() || extractingFile}
              size="sm"
              className="rounded-full gap-1.5"
            >
              다음 <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-center text-xs mt-4 text-neutral-400">
          Ctrl+V 로 붙여넣기 · txt, md, docx, pdf 파일 업로드 가능
        </p>
      </div>
    </motion.div>
  );
}
