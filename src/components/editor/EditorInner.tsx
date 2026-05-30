"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { chat, getAccessToken, type ChatSession } from "@/lib/api";
import { makeDefaultTitle } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

import PasteStep from "./PasteStep";
import SplitStep from "./SplitStep";
import CompanyDialog from "./CompanyDialog";
import ResultView, { type ParsedQuestion, type AdviseResult } from "./ResultView";

type Step = "paste" | "split" | "company" | "advise" | "result";

export default function EditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const urlStep = (searchParams.get("step") as Step | null) ?? "paste";
  const [step, setStepState] = useState<Step>(urlStep);

  const setStep = useCallback(
    (newStep: Step) => {
      setStepState(newStep);
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (newStep === "paste") {
        params.delete("step");
      } else {
        params.set("step", newStep);
      }
      router.push(`/editor${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router, searchParams]
  );

  const [docTitle, setDocTitle] = useState(makeDefaultTitle);
  const [coverLetter, setCoverLetter] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [adviseResults, setAdviseResults] = useState<(AdviseResult | null | "failed")[]>([]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const activeAdviseSessionRef = useRef<string | null>(null);
  const isAdviseInFlightRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
  }, [user, loading, router]);

  useEffect(() => {
    const sid = searchParams.get("session");
    if (sid && user) {
      // While a brand-new advise run is in flight, avoid re-hydrating the same
      // session from storage and overwriting optimistic/loading UI with "failed".
      if (isAdviseInFlightRef.current && activeAdviseSessionRef.current === sid) {
        return;
      }

      chat.getSession(sid).then(async (res) => {
        if (res.success) {
          setSessionId(res.data.session_id);
          setCompany(res.data.context.target_company_name ?? "");
          setDocTitle(res.data.title || makeDefaultTitle());
          // 에세이 컨텍스트에서 전체 문항 복원
          const ctx = res.data.context;
          let allQuestions: ParsedQuestion[] = [];
          if (ctx.essay_answer) {
            // combinedA 형식: [질문]\n답변\n\n[질문2]\n답변2
            const parts = ctx.essay_answer.split(/\n\n(?=\[)/);
            allQuestions = parts.map((part) => {
              const match = part.match(/^\[(.+?)\]\n([\s\S]*)$/);
              return match
                ? { question: match[1], answer: match[2] }
                : { question: ctx.essay_question ?? "자기소개서", answer: part };
            });
          }

          const advRes = await chat.getAdviseResults(res.data.session_id);
          const savedMap = new Map<number, AdviseResult>();
          if (advRes.success) {
            for (const item of advRes.data.items) {
              savedMap.set(item.question_index, item.result as AdviseResult);
              // 문항 정보가 없으면 advise result에서 복원
              if (allQuestions.length <= item.question_index) {
                allQuestions.push({
                  question: item.question,
                  answer: (item.result as { draft?: string })?.draft ?? "",
                });
              }
            }
          }

          if (allQuestions.length > 0) {
            setParsedQuestions(allQuestions);
            // 저장된 결과가 있으면 채우고, 없으면 "failed"로 재첨삭 가능
            const results: (AdviseResult | null | "failed")[] = allQuestions.map((_, i) =>
              savedMap.has(i) ? savedMap.get(i)! : "failed"
            );
            setAdviseResults(results);
          }
          setStepState("result");
        }
      });
    }
  }, [searchParams, user]);

  // Sync step state when URL changes (e.g. browser back/forward)
  useEffect(() => {
    const paramStep = (searchParams.get("step") as Step | null) ?? "paste";
    setStepState(paramStep);
  }, [searchParams]);

  /* ── 문항 분리 ── */
  const goToSplit = async () => {
    if (!coverLetter.trim()) return;
    setIsParsing(true);
    setStep("split");
    try {
      const res = await fetch("/api/parse-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter: coverLetter.trim() }),
      });
      const data = await res.json();
      if (data.success) setParsedQuestions(data.data);
      else setParsedQuestions([{ question: "자기소개서", answer: coverLetter.trim() }]);
    } catch {
      setParsedQuestions([{ question: "자기소개서", answer: coverLetter.trim() }]);
    }
    setIsParsing(false);
  };

  const goToCompany = () => {
    setStep("company");
  };

  /* ── 첨삭 시작 ── */
  const startAdvise = async () => {
    if (!company.trim()) return;
    setStep("result");

    const questions = parsedQuestions.length > 0
      ? parsedQuestions
      : [{ question: "자기소개서", answer: coverLetter.trim() }];

    const results: (AdviseResult | null | "failed")[] = new Array(questions.length).fill(null);
    setAdviseResults([...results]);

    const sessionTitle = position.trim()
      ? `${company.trim()} · ${position.trim()}`
      : company.trim();
    setDocTitle(sessionTitle);

    let createdSessionId: string | null = null;
    const sessionRes = await chat.createSession(sessionTitle);
    if (sessionRes.success) {
      createdSessionId = sessionRes.data.session_id;
      activeAdviseSessionRef.current = createdSessionId;
      isAdviseInFlightRef.current = true;
      setSessionId(createdSessionId);
      // URL에 session 반영 (다른 페이지 갔다 돌아와도 복원 가능)
      router.replace(`/editor?session=${createdSessionId}&step=result`);
      const combinedQ = questions.map((q) => q.question).join(" / ");
      const combinedA = questions.map((q) => `[${q.question}]\n${q.answer}`).join("\n\n");
      await chat.submitEssay(createdSessionId, combinedQ, combinedA);
    }

    try {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        try {
          const token = getAccessToken();
          const res = await fetch("/api/advise", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ draft: q.answer, question: q.question, company: company.trim() }),
          });
          const data = await res.json();
          if (data.success) {
            results[i] = data.data;
            setAdviseResults([...results]);
            if (createdSessionId) {
              chat.saveAdviseResult(createdSessionId, i, q.question, data.data).catch(() => {});
            }
          } else {
            results[i] = "failed";
            setAdviseResults([...results]);
          }
        } catch {
          results[i] = "failed";
          setAdviseResults([...results]);
        }
      }
    } finally {
      isAdviseInFlightRef.current = false;
    }

  };

  const retryAdvise = async (idx: number) => {
    const q = parsedQuestions[idx];
    if (!q) return;
    setAdviseResults((prev) => {
      const next = [...prev];
      next[idx] = null; // back to loading
      return next;
    });
    try {
      const token = getAccessToken();
      const res = await fetch("/api/advise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ draft: q.answer, question: q.question, company: company.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAdviseResults((prev) => {
          const next = [...prev];
          next[idx] = data.data;
          return next;
        });
        if (sessionId) {
          chat.saveAdviseResult(sessionId, idx, q.question, data.data).catch(() => {});
        }
      } else {
        setAdviseResults((prev) => {
          const next = [...prev];
          next[idx] = "failed";
          return next;
        });
      }
    } catch {
      setAdviseResults((prev) => {
        const next = [...prev];
        next[idx] = "failed";
        return next;
      });
    }
  };

  const loadSession = async (s: ChatSession) => {
    const res = await chat.getSession(s.session_id);
    if (res.success) {
      setSessionId(res.data.session_id);
      setCompany(res.data.context.target_company_name ?? s.title.split(" ")[0]);
      setDocTitle(res.data.title || s.title || makeDefaultTitle());
      const ctx = res.data.context;
      let allQuestions: ParsedQuestion[] = [];
      if (ctx.essay_answer) {
        const parts = ctx.essay_answer.split(/\n\n(?=\[)/);
        allQuestions = parts.map((part) => {
          const match = part.match(/^\[(.+?)\]\n([\s\S]*)$/);
          return match
            ? { question: match[1], answer: match[2] }
            : { question: ctx.essay_question ?? "자기소개서", answer: part };
        });
      }

      const advRes = await chat.getAdviseResults(res.data.session_id);
      const savedMap = new Map<number, AdviseResult>();
      if (advRes.success) {
        for (const item of advRes.data.items) {
          savedMap.set(item.question_index, item.result as AdviseResult);
          if (allQuestions.length <= item.question_index) {
            allQuestions.push({
              question: item.question,
              answer: (item.result as { draft?: string })?.draft ?? "",
            });
          }
        }
      }

      if (allQuestions.length > 0) {
        setParsedQuestions(allQuestions);
        const results: (AdviseResult | null | "failed")[] = allQuestions.map((_, i) =>
          savedMap.has(i) ? savedMap.get(i)! : "failed"
        );
        setAdviseResults(results);
      }
      setStep("result");
    }
  };

  const resetToHome = () => {
    setDocTitle(makeDefaultTitle());
    setCoverLetter("");
    setParsedQuestions([]);
    setAdviseResults([]);
    setCompany("");
    setPosition("");
    setSessionId(null);
    setStep("paste");
  };

  if (loading) return null;

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:0.25;transform:scale(0.85);}50%{opacity:1;transform:scale(1);} }
        .tdot{animation:blink 1.3s ease-in-out infinite;}
        .tdot:nth-child(2){animation-delay:0.18s;}
        .tdot:nth-child(3){animation-delay:0.36s;}
        textarea{resize:none;}
      `}</style>

      <div className="flex h-screen overflow-hidden bg-white flex-col lg:flex-row">
        <MobileHeader />
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 relative">
          {step === "paste" && (
            <PasteStep
              docTitle={docTitle}
              setDocTitle={setDocTitle}
              coverLetter={coverLetter}
              setCoverLetter={setCoverLetter}
              onNext={goToSplit}
            />
          )}

          {(step === "split" || step === "company") && (
            <SplitStep
              docTitle={docTitle}
              setDocTitle={setDocTitle}
              parsedQuestions={parsedQuestions}
              setParsedQuestions={setParsedQuestions}
              isParsing={isParsing}
              onBack={() => setStep("paste")}
              onNext={goToCompany}
            />
          )}

          <CompanyDialog
            open={step === "company"}
            company={company}
            setCompany={setCompany}
            position={position}
            setPosition={setPosition}
            onClose={() => setStep("split")}
            onStart={startAdvise}
            onTitleChange={setDocTitle}
          />

          {step === "result" && (
            <ResultView
              parsedQuestions={parsedQuestions}
              adviseResults={adviseResults}
              company={company}
              position={position}
              docTitle={docTitle}
              sessionId={sessionId}
              onBack={resetToHome}
              onRetry={retryAdvise}
            />
          )}
        </div>
      </div>
    </>
  );
}
