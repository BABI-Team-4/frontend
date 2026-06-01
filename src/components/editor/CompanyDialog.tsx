"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Search, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


interface CompanyDialogProps {
  open: boolean;
  company: string;
  setCompany: (v: string) => void;
  position: string;
  setPosition: (v: string) => void;
  onClose: () => void;
  onStart: () => void;
}

export default function CompanyDialog({
  open, company, setCompany, position, setPosition, onClose, onStart,
}: CompanyDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [companies, setCompanies] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // fetch supported companies
  useEffect(() => {
    fetch("/api/proxy/supported-companies")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setCompanies(d.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const filtered = useMemo(() => {
    const q = company.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.toLowerCase().includes(q));
  }, [company, companies]);

  const isSupported = companies.some((c) => c === company.trim());
  const isFreeInput = company.trim().length > 0 && !isSupported;

  const selectCompany = (name: string) => {
    setCompany(name);
    setShowDropdown(false);
    setHighlightIdx(-1);
  };

  const handleStart = () => {
    if (!company.trim()) return;
    onStart();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) {
      if (e.key === "Enter") handleStart();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((p) => (p + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((p) => (p <= 0 ? filtered.length - 1 : p - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIdx >= 0 && highlightIdx < filtered.length) {
        selectCompany(filtered[highlightIdx]);
      } else {
        handleStart();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="rounded-xl p-8 border-none shadow-2xl overflow-visible">
        <DialogHeader>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm mb-2 text-neutral-400 hover:text-black transition-colors w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 돌아가기
          </button>
          <DialogTitle className="text-2xl font-bold text-black">
            어떤 기업에 지원하시나요?
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">기업명을 입력하면 맞춤 첨삭을 시작합니다</p>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {/* Company search input */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <Input
                ref={inputRef}
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value);
                  setShowDropdown(true);
                  setHighlightIdx(-1);
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="기업명 검색 또는 직접 입력"
                className="h-12 pl-11 pr-5 text-base"
              />
            </div>

            {/* Dropdown */}
            {showDropdown && company.trim().length === 0 && companies.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">지원 기업</div>
                {companies.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => selectCompany(c)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${highlightIdx === i ? "bg-blue-50 text-blue-600" : "text-neutral-700 hover:bg-neutral-50"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {showDropdown && company.trim().length > 0 && (filtered.length > 0 || isFreeInput) && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {filtered.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => selectCompany(c)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${highlightIdx === i ? "bg-blue-50 text-blue-600" : "text-neutral-700 hover:bg-neutral-50"}`}
                  >
                    {c}
                    {c === company.trim() && <Check className="w-3.5 h-3.5 text-blue-500" />}
                  </button>
                ))}
                {isFreeInput && (
                  <button
                    onClick={() => { setShowDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-400 hover:bg-neutral-50 border-t border-neutral-100"
                  >
                    &ldquo;{company.trim()}&rdquo; (으)로 직접 입력
                  </button>
                )}
              </div>
            )}
          </div>

          <Input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
            placeholder="지원 직무 (선택 · 예: 소프트웨어개발자)"
            className="h-10 px-5"
          />
          <motion.button
            onClick={handleStart}
            disabled={!company.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm font-semibold transition-all"
            style={{
              background: company.trim() ? "#2563eb" : "#e5e5e5",
              color: company.trim() ? "white" : "#a3a3a3",
              cursor: company.trim() ? "pointer" : "not-allowed",
            }}
            whileTap={company.trim() ? { scale: 0.98 } : {}}
          >
            <Sparkles className="w-4 h-4" /> 첨삭 시작하기
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
