"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


interface CompanyDialogProps {
  open: boolean;
  company: string;
  setCompany: (v: string) => void;
  position: string;
  setPosition: (v: string) => void;
  onClose: () => void;
  onStart: () => void;
  onTitleChange: (title: string) => void;
}

export default function CompanyDialog({
  open, company, setCompany, position, setPosition, onClose, onStart, onTitleChange,
}: CompanyDialogProps) {
  const companyRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) setTimeout(() => companyRef.current?.focus(), 80);
  }, [open]);

  const handleStart = () => {
    if (!company.trim()) return;
    const title = position.trim() ? `${company.trim()} · ${position.trim()}` : company.trim();
    onTitleChange(title);
    onStart();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleStart();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="rounded-xl p-8 border-none shadow-2xl">
        <DialogHeader>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm mb-2 text-neutral-400 hover:text-black transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 돌아가기
          </button>
          <DialogTitle className="text-2xl font-bold text-black">
            어떤 기업에 지원하시나요?
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">기업명을 입력하면 맞춤 첨삭을 시작합니다</p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <Input
            ref={companyRef}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 삼성전자, SK하이닉스..."
            className="h-12 px-5 text-base"
          />
          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="지원 직무 (선택 · 예: 소프트웨어개발자)"
            className="h-10 px-5"
          />
          <motion.button
            onClick={handleStart}
            disabled={!company.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-semibold transition-all"
            style={{
              background: company.trim() ? "#2563eb" : "#e5e5e5",
              color: company.trim() ? "white" : "#a3a3a3",
              cursor: company.trim() ? "pointer" : "not-allowed",
            }}
            whileTap={company.trim() ? { scale: 0.98 } : {}}
          >
            <Sparkles className="w-4 h-4" /> 첨삭 시작하기
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
