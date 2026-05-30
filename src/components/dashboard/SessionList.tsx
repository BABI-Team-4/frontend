"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, ChevronRight, Plus, MoreHorizontal } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { chat, type ChatSession } from "@/lib/api";
import { timeAgo, sessionStatusLabel } from "@/lib/utils";

interface SessionListProps {
  sessions: ChatSession[];
  onDelete: (sessionId: string) => void;
  onRename: (sessionId: string, title: string) => void;
}

export default function SessionList({ sessions, onDelete, onRename }: SessionListProps) {
  const router = useRouter();
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);

  async function handleRename() {
    if (!renameTarget || !renameTitle.trim()) return;
    const res = await chat.renameSession(renameTarget.session_id, renameTitle.trim());
    if (res.success) {
      onRename(renameTarget.session_id, renameTitle.trim());
      setRenameTarget(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await chat.deleteSession(deleteTarget.session_id);
    if (res.success) {
      onDelete(deleteTarget.session_id);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="col-span-2 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-black">내 자기소개서</h2>
        <Link href="/sessions" className="text-xs flex items-center gap-0.5 text-neutral-400 hover:text-black transition-colors">
          전체보기 <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {sessions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-neutral-400">아직 작성한 자소서가 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {sessions.slice(0, 6).map((session, i) => {
              const st = sessionStatusLabel(session);
              return (
                <motion.li
                  key={session.session_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/editor?session=${session.session_id}`)}
                >
                  {/* Status dot */}
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: st.color }}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate leading-snug">
                      {session.title || "제목 없음"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-neutral-300 flex-shrink-0" />
                      <span className="text-xs text-neutral-400 flex-shrink-0">{timeAgo(session.updated_at)}</span>
                      {session.last_message && (
                        <>
                          <span className="text-neutral-200">·</span>
                          <span className="text-xs text-neutral-400 truncate">{session.last_message}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: `${st.color}14`, color: st.color }}
                  >
                    {st.text}
                  </span>

                  {/* Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-neutral-100 transition-all flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
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
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      <Link href="/editor">
        <button className="w-full py-2.5 border border-dashed rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          새 자기소개서 작성하기
        </button>
      </Link>

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
