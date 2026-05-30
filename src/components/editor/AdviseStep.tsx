"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileSearch, PenLine, CheckCircle2 } from "lucide-react";

interface AdviseStepProps {
  company: string;
  totalQ: number;
  adviseProgress: number;
}

const TIPS = [
  "합격 자소서와 비교 분석 중입니다",
  "문장 구조와 논리 흐름을 점검하고 있습니다",
  "직무 키워드 매칭도를 분석 중입니다",
  "구체적인 수정 방향을 도출하고 있습니다",
  "유사 합격 사례를 참고하고 있습니다",
];

const STEPS = [
  { icon: FileSearch, label: "합격 자소서 검색" },
  { icon: PenLine, label: "첨삭 분석" },
  { icon: CheckCircle2, label: "수정안 작성" },
];

export default function AdviseStep({ company, totalQ, adviseProgress }: AdviseStepProps) {
  const [tipIdx, setTipIdx] = useState(0);
  const progress = totalQ > 0 ? adviseProgress / totalQ : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Which internal step (0, 1, 2) based on progress
  const activeStep = progress >= 1 ? 2 : progress >= 0.5 ? 1 : 0;

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center bg-neutral-50 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-md text-center">
        {/* Animated icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center relative"
          style={{ background: "#eff6ff" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-7 h-7 text-blue-600" />
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-blue-200"
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>

        <h2 className="text-lg font-bold text-black mb-1">AI가 첨삭 중입니다</h2>
        <p className="text-sm text-neutral-500 mb-2">
          {company} · {totalQ}개 문항
        </p>

        {/* Rotating tips */}
        <div className="h-5 mb-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-neutral-400"
            >
              {TIPS[tipIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden mb-3 relative">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8)",
              backgroundSize: "200% 100%",
            }}
            initial={{ width: "0%" }}
            animate={{
              width: `${Math.max(progress * 100, 5)}%`,
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              width: { duration: 0.6, ease: "easeOut" },
              backgroundPosition: { duration: 1.5, repeat: Infinity, ease: "linear" },
            }}
          />
        </div>
        <p className="text-xs text-neutral-400 font-mono mb-8">
          {adviseProgress} / {totalQ} 완료
        </p>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && (
                  <div className="w-6 h-px" style={{ background: done || active ? "#2563eb" : "#e5e5e5" }} />
                )}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      background: done ? "#2563eb" : active ? "#eff6ff" : "#f5f5f5",
                    }}
                  >
                    <Icon
                      className="w-3 h-3"
                      style={{
                        color: done ? "white" : active ? "#2563eb" : "#a3a3a3",
                      }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-medium hidden sm:inline"
                    style={{ color: done || active ? "#2563eb" : "#a3a3a3" }}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
