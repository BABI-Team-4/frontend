"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard, FileText, GitCompare,
  BookOpen, Sparkles, LogOut, ChevronDown, Zap, Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard",  icon: LayoutDashboard, label: "대시보드" },
  { href: "/editor",     icon: FileText,         label: "자소서 작성" },
  { href: "/similarity", icon: GitCompare,       label: "유사도 분석" },
  { href: "/review",     icon: Sparkles,         label: "첨삭 결과" },
  { href: "/library",    icon: BookOpen,         label: "라이브러리" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, usage, logout } = useAuth();

  const initials = user?.name ? user.name.slice(0, 1) : "?";
  const limit = usage?.monthly_analysis_limit ?? 30;
  const used = usage?.monthly_analysis_used ?? 0;
  const remaining = limit - used;
  const resetAt = usage?.reset_at ? new Date(usage.reset_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric" }) : "";

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-[260px] flex flex-col flex-shrink-0 bg-white border-r border-neutral-200">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-[14px]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#2563eb" }}>
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-bold text-black">자소서AI</span>
        </Link>
        <button className="w-6 h-6 flex items-center justify-center rounded opacity-40 hover:opacity-70 transition-opacity">
          <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-500" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100">
          <Search className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
          <input type="text" placeholder="Search" className="flex-1 bg-transparent outline-none text-sm text-black" />
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5 flex-shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === "/editor" && pathname.startsWith("/editor"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors"
              style={{
                background: isActive ? "#eff6ff" : "transparent",
                color: isActive ? "#2563eb" : "#737373",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Credits */}
      <div className="px-3 pb-2">
        <div className="px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-500">AI 크레딧</span>
            <span className="text-xs font-mono font-semibold" style={{ color: "#2563eb" }}>{remaining}/{limit}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-neutral-200">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${limit > 0 ? (remaining / limit) * 100 : 0}%`, background: "#2563eb" }}
            />
          </div>
          <p className="text-xs mt-1.5 text-neutral-400">
            {used}크레딧 사용{resetAt ? ` · ${resetAt} 갱신` : ""}
          </p>
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3 flex items-center gap-2.5 border-t border-neutral-200">
        <Avatar className="w-7 h-7 flex-shrink-0">
          {user?.profile_image_url && <AvatarImage src={user.profile_image_url} alt={user.name ?? ""} />}
          <AvatarFallback className="text-xs font-semibold text-white" style={{ fontSize: 11, background: "#2563eb" }}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate text-black">{user?.name ?? user?.email ?? "사용자"}</div>
          <div className="text-xs text-neutral-400">{user?.plan ?? "Free"}</div>
        </div>
        {user ? (
          <button onClick={handleLogout} className="opacity-40 hover:opacity-70 transition-opacity" title="로그아웃">
            <LogOut className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        ) : (
          <Link href="/login" className="text-xs px-2.5 py-1 rounded-lg font-medium text-white" style={{ background: "#2563eb" }}>
            로그인
          </Link>
        )}
      </div>
    </aside>
  );
}
