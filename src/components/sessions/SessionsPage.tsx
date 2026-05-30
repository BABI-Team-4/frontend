"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { useAuth } from "@/lib/auth-context";
import { chat, type ChatSession } from "@/lib/api";
import { timeAgo, sessionStatusLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, FileText, MoreHorizontal, Plus } from "lucide-react";


export default function SessionsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (user) loadSessions(page);
  }, [user, loading, page, router]);

  async function loadSessions(p: number) {
    const res = await chat.listSessions(p, PAGE_SIZE);
    if (res.success) {
      setSessions(res.data.items);
      setTotal(res.data.total);
    }
  }

  async function handleRename() {
    if (!renameTarget || !renameTitle.trim()) return;
    const res = await chat.renameSession(renameTarget.session_id, renameTitle.trim());
    if (res.success) {
      setSessions((prev) => prev.map((s) => s.session_id === renameTarget.session_id ? { ...s, title: renameTitle.trim() } : s));
      setRenameTarget(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await chat.deleteSession(deleteTarget.session_id);
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.session_id !== deleteTarget.session_id));
      setTotal((t) => t - 1);
      setDeleteTarget(null);
    }
  }

  const filtered = sessions;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-neutral-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden flex-col lg:flex-row">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 px-4 md:px-8 py-4 flex items-center justify-between border-b bg-white border-neutral-200">
          <h1 className="text-lg md:text-xl font-bold text-black">내 자기소개서 전체</h1>
          <Link href="/editor">
            <Button className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm font-semibold flex items-center gap-1.5 text-white border-none" style={{ background: "#2563eb" }}>
              <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">새 자소서</span>
              <span className="sm:hidden">작성</span>
            </Button>
          </Link>
        </header>

        <div className="p-4 md:p-8 space-y-4">
          {filtered.length === 0 ? (
            <Card className="border border-neutral-200 shadow-none">
              <CardContent className="p-12 flex flex-col items-center gap-4">
                <FileText className="w-10 h-10 text-neutral-300" />
                <p className="text-sm text-neutral-500">작성한 자소서가 없습니다</p>
                <Link href="/editor">
                  <Button className="flex items-center gap-1.5 text-white border-none" style={{ background: "#2563eb" }}>
                    <Plus className="w-4 h-4" />
                    자소서 추가하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filtered.map((session, i) => {
              const st = sessionStatusLabel(session);
              return (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => router.push(`/editor?session=${session.session_id}`)}
                  >
                    <Card className="border border-neutral-200 shadow-none hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-sm text-black truncate">{session.title || "제목 없음"}</h3>
                              <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
                                style={{ background: `${st.color}15`, color: st.color }}
                              >
                                {st.text}
                              </span>
                            </div>
                            {session.last_message && (
                              <p className="text-xs mt-1 line-clamp-1 text-neutral-500">{session.last_message}</p>
                            )}
                            <span className="text-xs text-neutral-400 mt-1 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeAgo(session.updated_at)}
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => router.push(`/editor?session=${session.session_id}`)}>
                                열기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setRenameTitle(session.title || "");
                                setRenameTarget(session);
                              }}>
                                제목 변경
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeleteTarget(session)}
                              >
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              );
            })
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                이전
              </Button>
              <span className="text-sm text-neutral-500">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                다음
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>제목 변경</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
            placeholder="새 제목 입력"
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>취소</Button>
            <Button onClick={handleRename}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>세션을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 세션과 모든 메시지가 영구 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
