"use client";

import { useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { auth as authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function CallbackInner() {
  const { provider } = useParams<{ provider: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state || !provider) {
      router.replace("/login");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;

    authApi
      .oauthCallback(provider, code, state, redirectUri)
      .then(async (res) => {
        if (res.success) {
          await login(res.data.access_token, res.data.refresh_token);
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [provider, searchParams, router, login]);

  return (
    <div className="flex h-screen items-center justify-center" style={{ background: "oklch(0.97 0.003 247)" }}>
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto mb-4 rounded-xl flex items-center justify-center animate-pulse"
          style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 264), oklch(0.62 0.18 220))" }}
        >
          <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: "oklch(0.5 0.03 264)" }}>로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
