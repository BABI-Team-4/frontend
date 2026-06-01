"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { chat, type ChatSession } from "@/lib/api";
import { sessionDateGroupLabel } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  CreditCard,
  GitCompare,
  Loader2,
  LogOut,
  PenSquare,
  Settings2,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navItems = [
  { href: "/editor", icon: PenSquare, label: "자소서 작성" },
  { href: "/similarity", icon: GitCompare, label: "유사도 분석" },
  { href: "/library", icon: BookOpen, label: "라이브러리" },
];

const PAGE_SIZE = 12;

function groupSessionsByDate(sessions: ChatSession[]) {
  const groups = new Map<string, ChatSession[]>();

  for (const session of sessions) {
    const label = sessionDateGroupLabel(session.updated_at);
    const existing = groups.get(label) ?? [];
    existing.push(session);
    groups.set(label, existing);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeSessionId = searchParams.get("session");
  const initials = user?.name ? user.name.slice(0, 1) : "?";
  const groupedSessions = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const hasMore = sessions.length < total;

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    let cancelled = false;

    chat.listSessions(page, PAGE_SIZE).then((res) => {
      if (cancelled) return;
      if (res.success) {
        const newItems = res.data.items;
        setSessions((prev) => page === 1 ? newItems : [...prev, ...newItems]);
        setTotal(res.data.total);
        if (newItems.length === 0) setTotal((prev) => Math.min(prev, page === 1 ? 0 : (page - 1) * PAGE_SIZE));
      }
      setLoadingSessions(false);
      setIsFetchingMore(false);
    }).catch(() => {
      if (cancelled) return;
      setLoadingSessions(false);
      setIsFetchingMore(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading, page]);

  useEffect(() => {
    const node = loadMoreRef.current;
    const root = scrollContainerRef.current;
    if (!node || !root || loadingSessions || isFetchingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setIsFetchingMore(true);
        setPage((prev) => prev + 1);
      },
      { root, rootMargin: "160px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingSessions, isFetchingMore]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex w-[260px] flex-col shrink-0 bg-white border-r border-neutral-200">
      <div className="flex items-center justify-between px-4 py-3.5">
        <Link href="/editor" className="flex items-center gap-2">
          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-transparent">
            <Image src="/favicon.png" alt="자소서AI 로고" fill className="object-contain" sizes="28px" priority />
          </div>
          <span className="text-[15px] font-bold text-black">자소서AI</span>
        </Link>
        <button className="w-6 h-6 flex items-center justify-center rounded opacity-40 hover:opacity-70 transition-opacity">
          <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-500" />
        </button>
      </div>



      <nav className="px-2 space-y-0.5 shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/editor" && pathname.startsWith("/editor"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors"
              style={{
                background: isActive ? "#eff6ff" : "transparent",
                color: isActive ? "#2563eb" : "#737373",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pt-3.5 pb-2 border-t border-neutral-200">
        <div className="px-1">
          <span className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">최근 자소서</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-2.5 pb-2.5 flex flex-col">
        <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading || (user && loadingSessions && sessions.length === 0) ? (
            <div className="px-2 py-6 text-sm text-neutral-400">세션 불러오는 중...</div>
          ) : groupedSessions.length === 0 ? (
            <div className="px-2 py-6 text-sm text-neutral-400">
              아직 저장된 자소서가 없습니다.
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="mb-4">
                <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((session) => {
                    const isActive = pathname.startsWith("/editor") && activeSessionId === session.session_id;
                    return (
                      <div
                        key={session.session_id}
                        className="group relative rounded-lg transition-colors"
                        style={{
                          background: isActive ? "#eff6ff" : "transparent",
                          border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                        }}
                      >
                        <button
                          onClick={() => router.push(`/editor?session=${session.session_id}`)}
                          className="w-full rounded-lg px-2.5 py-2 text-left"
                        >
                          <div className="truncate text-sm font-medium text-neutral-800 pr-6">
                            {session.title || "제목 없는 자소서"}
                          </div>
                          <div className="mt-1 truncate text-xs leading-relaxed text-neutral-400">
                            {session.last_message || "저장된 미리보기가 없습니다."}
                          </div>
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const res = await chat.deleteSession(session.session_id);
                            if (res.success) {
                              setSessions((prev) => prev.filter((s) => s.session_id !== session.session_id));
                              setTotal((prev) => Math.max(0, prev - 1));
                              if (isActive) router.push("/editor");
                            }
                          }}
                          className="absolute right-2 top-2 hidden group-hover:flex w-6 h-6 items-center justify-center rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          {!loadingSessions && hasMore && <div ref={loadMoreRef} className="h-6" />}
          {isFetchingMore && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-300" />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <button
          onClick={() => setProfileOpen(true)}
          className="flex w-full items-center gap-2.5 px-3 py-3 text-left transition-colors hover:bg-neutral-50"
        >
          <Avatar className="w-7 h-7 flex-shrink-0">
            {user?.profile_image_url && <AvatarImage src={user.profile_image_url} alt={user.name ?? ""} />}
            <AvatarFallback className="text-xs font-semibold text-white" style={{ fontSize: 11, background: "#2563eb" }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-black">{user?.name ?? user?.email ?? "사용자"}</div>
            <div className="text-xs text-neutral-400">{user?.plan ?? "Free"} 플랜</div>
          </div>
          <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-neutral-400" />
        </button>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-100">
            <DialogTitle>내 계정</DialogTitle>
            <DialogDescription>계정 설정과 플랜 정보를 여기서 확인할 수 있습니다.</DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                {user?.profile_image_url && <AvatarImage src={user.profile_image_url} alt={user.name ?? ""} />}
                <AvatarFallback className="text-sm font-semibold text-white" style={{ background: "#2563eb" }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-black">{user?.name ?? "사용자"}</div>
                <div className="truncate text-xs text-neutral-400">{user?.email ?? "이메일 정보 없음"}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <Settings2 className="h-4 w-4 text-neutral-500" />
                  <div>
                    <div className="text-sm font-medium text-black">설정</div>
                    <div className="text-xs text-neutral-400">프로필과 기본 환경을 관리합니다</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/billing");
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-neutral-500" />
                  <div>
                    <div className="text-sm font-medium text-black">요금제</div>
                    <div className="text-xs text-neutral-400">{user?.plan ?? "Free"} 플랜을 사용 중입니다</div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-2xl border border-red-100 px-4 py-3 text-left transition-colors hover:bg-red-50"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="text-sm font-medium text-red-600">로그아웃</div>
                    <div className="text-xs text-red-300">현재 세션에서 로그아웃합니다</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
