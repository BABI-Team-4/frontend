"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileHeader from "@/components/MobileHeader";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { users } from "@/lib/api";
import { Bell, Building2, Check, FileText, UserRound } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [defaultCompany, setDefaultCompany] = useState("");
  const [defaultPosition, setDefaultPosition] = useState("");
  const [emailNotice, setEmailNotice] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setDefaultCompany(localStorage.getItem("default_company") ?? "");
    setDefaultPosition(localStorage.getItem("default_position") ?? "");
    setEmailNotice(localStorage.getItem("email_notice") !== "false");
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      if (name.trim() && name.trim() !== user?.name) {
        const res = await users.update({ name: name.trim() });
        if (res.success) await refreshUser();
      }
      localStorage.setItem("default_company", defaultCompany.trim());
      localStorage.setItem("default_position", defaultPosition.trim());
      localStorage.setItem("email_notice", String(emailNotice));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex h-[var(--app-viewport-height)] overflow-hidden bg-white flex-col lg:flex-row">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <header className="mb-6">
            <h1 className="text-xl font-bold text-black">설정</h1>
            <p className="mt-1 text-sm text-neutral-500">계정 정보와 작성 기본값을 관리합니다.</p>
          </header>

          <div className="space-y-5">
            <section className="rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
                <UserRound className="h-4 w-4 text-neutral-500" />
                <h2 className="text-sm font-semibold text-black">프로필</h2>
              </div>
              <div className="space-y-4 px-5 py-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-500">이름</span>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-500">이메일</span>
                  <Input value={user?.email ?? ""} disabled />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
                <Building2 className="h-4 w-4 text-neutral-500" />
                <h2 className="text-sm font-semibold text-black">작성 기본값</h2>
              </div>
              <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-500">기본 기업</span>
                  <Input value={defaultCompany} onChange={(e) => setDefaultCompany(e.target.value)} placeholder="예: 삼성전자" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-500">기본 직무</span>
                  <Input value={defaultPosition} onChange={(e) => setDefaultPosition(e.target.value)} placeholder="예: 소프트웨어 개발" />
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 border-b border-neutral-100 px-5 py-4">
                <Bell className="h-4 w-4 text-neutral-500" />
                <h2 className="text-sm font-semibold text-black">알림</h2>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotice((v) => !v)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-neutral-400" />
                  <div>
                    <div className="text-sm font-medium text-black">첨삭 결과 이메일 알림</div>
                    <div className="text-xs text-neutral-400">완료 알림을 받을지 선택합니다.</div>
                  </div>
                </div>
                <span
                  className="h-5 w-9 rounded-full p-0.5 transition-colors"
                  style={{ background: emailNotice ? "#2563eb" : "#d4d4d4" }}
                >
                  <span
                    className="block h-4 w-4 rounded-full bg-white transition-transform"
                    style={{ transform: emailNotice ? "translateX(16px)" : "translateX(0)" }}
                  />
                </span>
              </button>
            </section>

            <div className="flex justify-end gap-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <Check className="h-4 w-4" />
                  저장됨
                </span>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
