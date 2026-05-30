import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ChatSession } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

export function makeDefaultTitle() {
  return "";
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export function sessionStatusLabel(s: ChatSession) {
  if (s.status === "closed" || s.status === "analyzed") return { text: "첨삭완료", color: "#10b981" };
  if (s.status === "active") return { text: "작성중", color: "#0a0a0a" };
  return { text: s.status, color: "#737373" };
}

export function sessionDateGroupLabel(dateStr: string) {
  const target = new Date(dateStr);
  const today = new Date();

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.floor((startOfToday.getTime() - startOfTarget.getTime()) / 86400000);

  if (diffDays <= 0) return "오늘";
  if (diffDays === 1) return "어제";
  if (diffDays < 7) return "최근 7일";
  if (today.getFullYear() === target.getFullYear() && today.getMonth() === target.getMonth()) return "이번 달";
  return `${target.getFullYear()}년 ${target.getMonth() + 1}월`;
}
