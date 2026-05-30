"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi } from "@/lib/api";

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      router.replace(`/login?error=${error ?? "kakao_cancelled"}`);
      return;
    }

    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!;

    authApi
      .oauthCallback("kakao", code, "", redirectUri)
      .then(async (res) => {
        if (res.success) {
          await login(res.data.access_token, res.data.refresh_token);
          router.replace("/editor");
        } else {
          router.replace("/login?error=oauth_failed");
        }
      })
      .catch(() => {
        router.replace("/login?error=oauth_failed");
      });
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <span className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">카카오 로그인 중...</p>
      </div>
    </div>
  );
}
