"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { chat, type ChatSession, type ChatMessage, type ChatContext } from "@/lib/api";
import {
  Plus, Search, Sparkles, FileText, LogOut, Zap,
  LayoutDashboard, GitCompare, BookOpen, ChevronDown,
  MoreHorizontal, ArrowUp, Mic, ChevronRight, ArrowLeft,
  ClipboardPaste,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Step = "paste" | "company" | "chat";

const NAV_ITEMS = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "대시보드" },
  { href: "/editor",      icon: FileText,         label: "자소서 작성", active: true },
  { href: "/similarity",  icon: GitCompare,       label: "유사도 분석" },
  { href: "/library",     icon: BookOpen,         label: "라이브러리" },
];

function parseMarkdown(text: string, isAI: boolean) {
  return text.split("\n").map((line, i, arr) => {
    if (line === "---") return <hr key={i} className="border-neutral-200 my-2.5" />;
    if (line.startsWith("> ")) {
      return (
        <span key={i} className="block border-l-[3px] border-neutral-300 pl-2.5 text-neutral-500 italic my-1">
          {line.slice(2)}{i < arr.length - 1 && <br />}
        </span>
      );
    }
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) return <strong key={j} className={isAI ? "font-semibold text-black" : "font-semibold text-white"}>{part.slice(2, -2)}</strong>;
          if (part.startsWith("*") && part.endsWith("*")) return <em key={j} className={isAI ? "italic text-neutral-500" : "italic text-white/80"}>{part.slice(1, -1)}</em>;
          return <span key={j}>{part}</span>;
        })}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAI = msg.role === "assistant";
  return (
    <motion.div
      className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {isAI && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#2563eb" }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[75%] ${isAI ? "" : "items-end flex flex-col"}`}>
        <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed" style={{
          background: isAI ? "white" : "#2563eb",
          color: isAI ? "#262626" : "white",
          border: isAI ? "1px solid #e5e5e5" : "none",
          whiteSpace: "pre-wrap",
        }}>
          {parseMarkdown(msg.content, isAI)}
        </div>
        {msg.created_at && (
          <span className="text-xs mt-1 px-1 text-neutral-400">
            {new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function EditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, usage, loading, logout } = useAuth();

  const initials = user?.name ? user.name.slice(0, 1) : "?";
  const limit = usage?.monthly_analysis_limit ?? 30;
  const used = usage?.monthly_analysis_used ?? 0;
  const remaining = limit - used;

  const [step, setStep] = useState<Step>("paste");
  const [coverLetter, setCoverLetter] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [context, setContext] = useState<ChatContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recentSessions, setRecentSessions] = useState<ChatSession[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (user) {
      chat.listSessions(1, 20).then((res) => {
        if (res.success) setRecentSessions(res.data.items);
      });
    }
  }, [user, loading, router]);

  useEffect(() => {
    const sid = searchParams.get("session");
    if (sid && user) {
      chat.getSession(sid).then((res) => {
        if (res.success) {
          setSessionId(res.data.session_id);
          setMessages(res.data.messages);
          setContext(res.data.context);
          setCompany(res.data.context.target_company_name ?? "");
          setStep("chat");
        }
      });
    }
  }, [searchParams, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const goToCompany = () => {
    if (!coverLetter.trim()) return;
    setStep("company");
    setTimeout(() => companyRef.current?.focus(), 80);
  };

  const startChat = async () => {
    if (!company.trim()) return;
    setIsTyping(true);
    setStep("chat");

    const res = await chat.createSession(`기업: ${company.trim()}${position ? `, 직무: ${position}` : ""}`);
    if (res.success) {
      setSessionId(res.data.session_id);
      setContext(res.data.context);
      setMessages([res.data.assistant_message]);

      if (coverLetter.trim()) {
        const essayRes = await chat.submitEssay(res.data.session_id, `${company} 자기소개서`, coverLetter.trim());
        if (essayRes.success) {
          const msgRes = await chat.sendMessage(res.data.session_id, "자소서를 제출했습니다. 분석해주세요.");
          if (msgRes.success) {
            setMessages((prev) => [...prev, msgRes.data.user_message, msgRes.data.assistant_message]);
            setContext(msgRes.data.context);
          }
        }
      }
    }
    setIsTyping(false);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping || !sessionId) return;
    setInput("");
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = "44px";

    const res = await chat.sendMessage(sessionId, text);
    if (res.success) {
      setMessages((prev) => [...prev, res.data.user_message, res.data.assistant_message]);
      setContext(res.data.context);
    }
    setIsTyping(false);
  }, [input, isTyping, sessionId]);

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const loadSession = async (s: ChatSession) => {
    const res = await chat.getSession(s.session_id);
    if (res.success) {
      setSessionId(res.data.session_id);
      setMessages(res.data.messages);
      setContext(res.data.context);
      setCompany(res.data.context.target_company_name ?? s.title.split(" ")[0]);
      setStep("chat");
    }
  };

  const resetToHome = () => {
    setStep("paste");
    setCoverLetter("");
    setCompany("");
    setPosition("");
    setMessages([]);
    setSessionId(null);
    setContext(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const filteredConvs = recentSessions.filter(
    (c) => !sidebarSearch || c.title.includes(sidebarSearch)
  );

  if (loading) return null;

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100% { opacity:0.25; transform:scale(0.85); } 50% { opacity:1; transform:scale(1); } }
        .tdot { animation: blink 1.3s ease-in-out infinite; }
        .tdot:nth-child(2) { animation-delay: 0.18s; }
        .tdot:nth-child(3) { animation-delay: 0.36s; }
        textarea { resize: none; }
        .conv-row:hover .conv-more { opacity: 1; }
        .conv-more { opacity: 0; transition: opacity 0.12s; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-white">
        {/* SIDEBAR */}
        <aside className="flex flex-col flex-shrink-0 bg-white border-r border-neutral-200" style={{ width: 260 }}>
          <div className="flex items-center justify-between px-4 py-[14px]">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#2563eb" }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display text-[15px] font-medium text-black">자소서AI</span>
            </Link>
            <button className="w-6 h-6 flex items-center justify-center rounded opacity-40 hover:opacity-70 transition-opacity">
              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-neutral-500" />
            </button>
          </div>

          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100">
              <Search className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
              <input type="text" placeholder="Search" value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="flex-1 bg-transparent outline-none text-sm text-black" />
            </div>
          </div>

          <div className="px-3 pb-3">
            <button onClick={resetToHome} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-black border border-neutral-200 hover:bg-neutral-50 transition-colors">
              <Plus className="w-3.5 h-3.5" /> 새 자소서
            </button>
          </div>

          <nav className="px-3 pb-2 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors" style={{ background: item.active ? "#eff6ff" : "transparent", color: item.active ? "#2563eb" : "#737373", fontWeight: item.active ? 500 : 400 }}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="h-px bg-neutral-200 mx-3 my-1" />

          <div className="px-4 py-2 flex-shrink-0">
            <span className="text-xs font-medium text-neutral-400">최근</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
            {filteredConvs.map((conv) => (
              <button key={conv.session_id} onClick={() => loadSession(conv)} className="conv-row w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-between gap-2" style={{ background: sessionId === conv.session_id ? "#f5f5f5" : "transparent", color: sessionId === conv.session_id ? "#0a0a0a" : "#737373" }}>
                <span className="truncate">{conv.title}</span>
                <span className="conv-more flex-shrink-0"><MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" /></span>
              </button>
            ))}
          </div>

          <div className="px-3 pb-2">
            <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-neutral-500">AI 크레딧</span>
                <span className="text-xs font-mono font-semibold text-black">{remaining}/{limit}</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden bg-neutral-200">
                <div className="h-full rounded-full bg-black" style={{ width: `${limit > 0 ? (remaining / limit) * 100 : 0}%`, background: "#2563eb" }} />
              </div>
            </div>
          </div>

          <div className="px-3 py-3 flex items-center gap-2.5 border-t border-neutral-200">
            <Avatar className="w-7 h-7 flex-shrink-0">
              {user?.profile_image_url && <AvatarImage src={user.profile_image_url} alt={user.name ?? ""} />}
              <AvatarFallback className="text-xs font-semibold text-white" style={{ background: "#2563eb", fontSize: 11 }}>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate text-black">{user?.name ?? user?.email ?? "사용자"}</div>
              <div className="text-xs text-neutral-400">{user?.plan ?? "Free"}</div>
            </div>
            <button onClick={handleLogout} className="opacity-40 hover:opacity-70 transition-opacity">
              <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex flex-col flex-1 min-w-0">
          {step === "paste" && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center px-8 bg-neutral-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4 bg-neutral-100 text-neutral-600">
                    <Sparkles className="w-3 h-3" /> AI 자소서 첨삭
                  </div>
                  <h1 className="text-2xl font-bold mb-2 text-black">자소서를 붙여넣어 주세요</h1>
                  <p className="text-sm text-neutral-500">AI가 구체성·차별화·직무 연관성을 즉시 분석합니다</p>
                </div>
                <div className="rounded-2xl overflow-hidden bg-white shadow-sm" style={{ border: coverLetter.trim() ? "1.5px solid #2563eb" : "1.5px solid #e5e5e5", transition: "border-color 0.2s" }}>
                  <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="여기에 자소서 내용을 붙여넣으세요..." className="w-full px-5 py-4 text-sm leading-relaxed outline-none bg-transparent text-black" style={{ height: 280, fontFamily: "inherit", resize: "none" }} />
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-100">
                    <span className="text-xs font-mono text-neutral-400">
                      {coverLetter.trim().length > 0 ? `${coverLetter.trim().length.toLocaleString()}자` : "0자"}
                    </span>
                    <motion.button
                      onClick={goToCompany}
                      disabled={!coverLetter.trim()}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                      style={{ background: coverLetter.trim() ? "#2563eb" : "#e5e5e5", color: coverLetter.trim() ? "white" : "#a3a3a3", cursor: coverLetter.trim() ? "pointer" : "not-allowed" }}
                      whileTap={coverLetter.trim() ? { scale: 0.96 } : {}}
                    >
                      다음 <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-center text-xs mt-4 text-neutral-400">Ctrl+V 로 붙여넣기 · 여러 문항을 한 번에 넣어도 됩니다</p>
              </div>
            </motion.div>
          )}

          {step === "company" && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center px-8 bg-neutral-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="w-full max-w-md">
                <button onClick={() => setStep("paste")} className="flex items-center gap-1.5 text-sm mb-8 text-neutral-400 hover:text-black transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> 자소서 수정
                </button>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6 text-xs bg-neutral-100 text-neutral-600">
                  <ClipboardPaste className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{coverLetter.trim().slice(0, 50)}…</span>
                  <span className="flex-shrink-0 font-mono font-semibold text-black">{coverLetter.trim().length.toLocaleString()}자</span>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-black">어떤 기업에 지원하시나요?</h1>
                <p className="text-sm mb-6 text-neutral-500">기업명을 입력하면 맞춤 첨삭을 시작합니다</p>
                <div className="rounded-2xl overflow-hidden mb-3 bg-white shadow-sm" style={{ border: company.trim() ? "1.5px solid #2563eb" : "1.5px solid #e5e5e5", transition: "border-color 0.2s" }}>
                  <input ref={companyRef} type="text" value={company} onChange={(e) => setCompany(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") startChat(); }} placeholder="예: 삼성전자, 카카오, 토스..." className="w-full px-5 py-4 text-base outline-none bg-transparent text-black" />
                </div>
                <div className="rounded-xl overflow-hidden mb-6 bg-white" style={{ border: "1.5px solid #e5e5e5" }}>
                  <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") startChat(); }} placeholder="지원 직무 (선택 · 예: 백엔드 개발자)" className="w-full px-5 py-3 text-sm outline-none bg-transparent text-black" />
                </div>
                <motion.button
                  onClick={startChat}
                  disabled={!company.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold transition-all"
                  style={{ background: company.trim() ? "#2563eb" : "#e5e5e5", color: company.trim() ? "white" : "#a3a3a3", cursor: company.trim() ? "pointer" : "not-allowed" }}
                  whileTap={company.trim() ? { scale: 0.98 } : {}}
                >
                  <Sparkles className="w-4 h-4" /> 첨삭 시작하기
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === "chat" && (
            <>
              <header className="flex items-center justify-between px-6 py-3 flex-shrink-0 bg-white border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <button onClick={resetToHome} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                  <div>
                    <h1 className="text-sm font-semibold leading-none text-black">
                      {company}{position ? ` · ${position}` : ""} 첨삭
                    </h1>
                    <p className="text-xs mt-0.5 text-neutral-500">
                      {context?.ready_for_analysis ? "분석 준비 완료" : "대화 진행 중"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {context?.ready_for_analysis && sessionId && (
                    <Link href={`/review?session=${sessionId}`}>
                      <motion.button
                        className="text-xs px-3 py-1.5 rounded-full font-semibold text-white" style={{ background: "#2563eb" }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Sparkles className="w-3 h-3 inline mr-1" /> AI 분석 시작
                      </motion.button>
                    </Link>
                  )}
                </div>
              </header>

              <div className="flex-1 overflow-y-auto bg-neutral-50">
                <div className="max-w-2xl mx-auto py-8 px-4 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-xs text-neutral-400">오늘 · {new Date().toLocaleDateString("ko-KR")}</span>
                    <div className="flex-1 h-px bg-neutral-200" />
                  </div>
                  {messages.map((msg) => <MessageBubble key={msg.message_id} msg={msg} />)}
                  {isTyping && (
                    <motion.div
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#2563eb" }}>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-neutral-200">
                        {[0, 1, 2].map((i) => <div key={i} className="tdot w-1.5 h-1.5 rounded-full bg-neutral-400" />)}
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-neutral-200">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1">
                    {["지원동기 첨삭", "성장과정 개선", "수치 추가 제안", "문장 다듬기", "차별화 포인트"].map((q) => (
                      <button key={q} onClick={() => setInput(q)} className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 hover:bg-neutral-200 transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-3 px-4 py-3 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                    <button className="w-7 h-7 flex items-center justify-center rounded-xl flex-shrink-0 bg-neutral-100 text-neutral-500">
                      <Plus className="w-4 h-4" />
                    </button>
                    <textarea ref={textareaRef} value={input} onChange={handleTextareaChange} onKeyDown={handleChatKey} placeholder="질문하거나 특정 문항을 붙여넣으세요..." className="flex-1 bg-transparent outline-none text-sm leading-relaxed text-black placeholder:text-neutral-400" style={{ height: 44, maxHeight: 200, paddingTop: "10px", resize: "none" }} rows={1} />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="w-7 h-7 flex items-center justify-center rounded-xl text-neutral-400">
                        <Mic className="w-4 h-4" />
                      </button>
                      <motion.button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                        style={{ background: input.trim() && !isTyping ? "#2563eb" : "#e5e5e5", color: input.trim() && !isTyping ? "white" : "#a3a3a3" }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-center text-xs mt-2 text-neutral-400">Enter로 전송 · Shift+Enter로 줄바꿈</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function EditorPage() {
  return (
    <Suspense>
      <EditorInner />
    </Suspense>
  );
}
