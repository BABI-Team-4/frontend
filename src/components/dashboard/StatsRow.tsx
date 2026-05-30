"use client";

import { motion } from "framer-motion";
import { FileText, TrendingUp, Sparkles, Flame } from "lucide-react";

interface StatsRowProps {
  sessionCount: number;
  analysisUsed: number;
  analysisLimit: number;
  recUsed: number;
  recLimit: number;
}

export default function StatsRow({
  sessionCount,
  analysisUsed,
  analysisLimit,
  recUsed,
  recLimit,
}: StatsRowProps) {
  const stats = [
    { label: "내 자소서", value: `${sessionCount}개`, icon: FileText, accent: "#2563eb" },
    { label: "첨삭 사용", value: `${analysisUsed}건`, icon: TrendingUp, accent: "#059669" },
    { label: "추천 사용", value: `${recUsed}건`, icon: Sparkles, accent: "#7c3aed" },
    { label: "남은 크레딧", value: `${Math.max(0, analysisLimit - analysisUsed)}개`, icon: Flame, accent: "#dc2626" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-sm transition-all duration-200"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${stat.accent}12` }}
            >
              <Icon className="w-4 h-4" style={{ color: stat.accent }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-neutral-400 leading-none mb-0.5">{stat.label}</p>
              <p className="text-base font-bold text-black leading-none">{stat.value}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
