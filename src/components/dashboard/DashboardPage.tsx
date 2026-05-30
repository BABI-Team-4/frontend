"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/lib/auth-context";
import { chat, type ChatSession } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import StatsRow from "./StatsRow";
import SessionList from "./SessionList";
import UsageCard from "./UsageCard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, usage, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (user) {
      chat.listSessions(1, 10).then((res) => {
        if (res.success) setSessions(res.data.items);
      });
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-[var(--app-viewport-height)] items-center justify-center">
        <p className="text-sm text-neutral-500">로딩 중...</p>
      </div>
    );
  }

  const analysisUsed = usage?.monthly_analysis_used ?? 0;
  const analysisLimit = usage?.monthly_analysis_limit ?? 30;
  const recUsed = usage?.monthly_recommendation_used ?? 0;
  const recLimit = usage?.monthly_recommendation_limit ?? 0;

  return (
    <div className="flex h-[var(--app-viewport-height)] overflow-hidden flex-col lg:flex-row">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 px-4 md:px-8 py-4 flex items-center justify-between border-b bg-white border-neutral-200">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-black">안녕하세요, {user?.name ?? "사용자"}님</h1>
            <p className="text-xs md:text-sm text-neutral-500 hidden sm:block">오늘도 합격에 한 걸음 더 다가가 보세요.</p>
          </div>
          <Link href="/editor">
            <Button className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm font-semibold flex items-center gap-1.5 text-white border-none" style={{ background: "#2563eb" }}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">새 자소서</span>
              <span className="sm:hidden">작성</span>
            </Button>
          </Link>
        </header>

        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          <StatsRow
            sessionCount={sessions.length}
            analysisUsed={analysisUsed}
            analysisLimit={analysisLimit}
            recUsed={recUsed}
            recLimit={recLimit}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SessionList
              sessions={sessions}
              onDelete={(sessionId) => setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))}
              onRename={(sessionId, title) => setSessions((prev) => prev.map((s) => s.session_id === sessionId ? { ...s, title } : s))}
            />
            <UsageCard
              analysisUsed={analysisUsed}
              analysisLimit={analysisLimit}
              recUsed={recUsed}
              recLimit={recLimit}
              plan={usage?.plan ?? user?.plan ?? "free"}
              resetAt={usage?.reset_at}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
