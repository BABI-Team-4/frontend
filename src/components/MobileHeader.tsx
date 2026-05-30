"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, GitCompare, BookOpen, PenSquare, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/editor", icon: PenSquare, label: "자소서 작성" },
  { href: "/similarity", icon: GitCompare, label: "유사도 분석" },
  { href: "/library", icon: BookOpen, label: "라이브러리" },
];

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, usage, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = user?.name ? user.name.slice(0, 1) : "?";
  const limit = usage?.monthly_analysis_limit ?? 30;
  const used = usage?.monthly_analysis_used ?? 0;
  const remaining = Math.max(0, limit - used);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
    setOpen(false);
  };

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-200 flex-shrink-0">
      <Link href="/editor" className="flex items-center gap-2">
        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
          <Image src="/favicon.png" alt="자소서AI 로고" fill className="object-contain" sizes="28px" priority />
        </div>
        <span className="text-[15px] font-bold text-black">자소서AI</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <div role="button" tabIndex={0} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
            <Menu className="w-5 h-5 text-neutral-600" />
          </div>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
            <Link href="/editor" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
                <Image src="/favicon.png" alt="자소서AI 로고" fill className="object-contain" sizes="28px" priority />
              </div>
              <span className="text-[15px] font-bold text-black">자소서AI</span>
            </Link>
            <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100">
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          <nav className="px-3 py-2 space-y-0.5 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/editor" && pathname.startsWith("/editor"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{
                    background: isActive ? "#eff6ff" : "transparent",
                    color: isActive ? "#2563eb" : "#737373",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          <div className="px-3 pb-3">
            <div className="px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-500">AI 크레딧</span>
                <span className="text-xs font-mono font-semibold text-blue-600">{remaining}/{limit}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden bg-neutral-200">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-blue-600"
                  style={{ width: `${limit > 0 ? (remaining / limit) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="px-3 py-3 flex items-center gap-2.5 border-t border-neutral-200">
            <Avatar className="w-7 h-7 flex-shrink-0">
              {user?.profile_image_url && <AvatarImage src={user.profile_image_url} alt={user.name ?? ""} />}
              <AvatarFallback className="text-xs font-semibold text-white bg-blue-600" style={{ fontSize: 11 }}>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-black">{user?.name ?? user?.email ?? "사용자"}</div>
              <div className="text-xs text-neutral-400">{user?.plan ?? "Free"}</div>
            </div>
            <button onClick={handleLogout} className="opacity-40 hover:opacity-70 transition-opacity">
              <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
