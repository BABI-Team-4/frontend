"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import {
  Search, Building2, ChevronLeft, ChevronRight,
  FileText, GraduationCap, Briefcase, Calendar, X,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { library, type LibraryEssay, type LibraryTags } from "@/lib/api";

const PAGE_SIZE = 20;

const ORG_LABELS: Record<string, string> = {
  corp: "기업",
  bank: "금융",
  public: "공기업",
};

function OrgBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    corp: { bg: "#eff6ff", text: "#2563eb" },
    bank: { bg: "#fef3c7", text: "#d97706" },
    public: { bg: "#ecfdf5", text: "#059669" },
  };
  const s = map[type] ?? { bg: "#f5f5f5", text: "#737373" };
  return (
    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.text }}>
      {ORG_LABELS[type] ?? type}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <Select value={value || undefined} onValueChange={(v: string | null) => onChange(!v || v === "__all__" ? "" : v)}>
      <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs rounded-lg border-neutral-200 bg-white">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectItem value="__all__">{label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qKeyword = searchParams.get("keyword") ?? "";
  const qOrgType = searchParams.get("org_type") ?? "";
  const qHireType = searchParams.get("hire_type") ?? "";
  const qYear = searchParams.get("year") ?? "";
  const qSeason = searchParams.get("season") ?? "";
  const qPage = parseInt(searchParams.get("page") ?? "1", 10);

  const [keyword, setKeyword] = useState(qKeyword);
  const [items, setItems] = useState<LibraryEssay[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<LibraryTags | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => { setKeyword(qKeyword); }, [qKeyword]);

  useEffect(() => {
    library.tags().then((res) => {
      if (res.success) setTags(res.data);
    }).catch(() => {});
  }, []);

  const updateParams = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (!("page" in updates)) params.delete("page");
    router.push(`/library?${params.toString()}`);
  }, [router, searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await library.list({
        page: qPage,
        limit: PAGE_SIZE,
        keyword: qKeyword || undefined,
        org_type: qOrgType || undefined,
        hire_type: qHireType || undefined,
        year: qYear ? parseInt(qYear, 10) : undefined,
        season: qSeason || undefined,
      });
      if (res.success) {
        setItems(res.data.items);
        setTotal(res.data.total);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [qPage, qKeyword, qOrgType, qHireType, qYear, qSeason]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => {
    updateParams({ keyword: keyword || undefined });
  };

  const activeFilterCount = [qOrgType, qHireType, qYear, qSeason].filter(Boolean).length;

  return (
    <div className="flex h-[var(--app-viewport-height)] overflow-hidden bg-white flex-col lg:flex-row">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 px-6 md:px-8 pt-6 pb-3 border-b border-neutral-200 bg-white">
          <h1 className="text-lg font-bold text-black">합격 자소서 라이브러리</h1>
          <p className="text-xs text-neutral-400 mt-0.5">{total.toLocaleString()}개의 합격 자소서</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-neutral-50">
          <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-6 md:py-8">

            {/* Search + Filter bar */}
            <div className="border border-neutral-200 rounded-xl bg-white p-4 mb-6">
              {/* Search row */}
              <div className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="기업명, 직무로 검색..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-neutral-200 bg-neutral-50 outline-none focus:border-blue-300 focus:bg-white transition-colors text-black placeholder:text-neutral-400"
                />
              </div>

              {/* Filter row */}
              <div className="flex items-center gap-2 flex-wrap">
                {tags && (
                  <>
                    <FilterSelect
                      label="분류 전체"
                      value={qOrgType}
                      options={tags.org_types.map((t) => ({ value: t, label: ORG_LABELS[t] ?? t }))}
                      onChange={(v) => updateParams({ org_type: v || undefined })}
                    />
                    <FilterSelect
                      label="채용 전체"
                      value={qHireType}
                      options={tags.hire_types.map((t) => ({ value: t, label: t }))}
                      onChange={(v) => updateParams({ hire_type: v || undefined })}
                    />
                    <FilterSelect
                      label="연도 전체"
                      value={qYear}
                      options={tags.years.map((y) => ({ value: String(y), label: `${y}년` }))}
                      onChange={(v) => updateParams({ year: v || undefined })}
                    />
                    <FilterSelect
                      label="시기 전체"
                      value={qSeason}
                      options={tags.seasons.map((s) => ({ value: s, label: s }))}
                      onChange={(v) => updateParams({ season: v || undefined })}
                    />
                  </>
                )}

                <div className="flex-1" />

                {activeFilterCount > 0 && (
                  <button
                    onClick={() => router.push("/library")}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    초기화
                  </button>
                )}

                <button
                  onClick={handleSearch}
                  className="h-8 px-4 text-xs font-semibold rounded-lg text-white transition-colors"
                  style={{ background: "#2563eb" }}
                >
                  검색
                </button>
              </div>
            </div>

            {/* Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-neutral-200 rounded-xl bg-white p-5 animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100" />
                        <div>
                          <div className="h-3.5 w-20 bg-neutral-100 rounded mb-1.5" />
                          <div className="h-3 w-14 bg-neutral-100 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-8 bg-neutral-100 rounded" />
                    </div>
                    <div className="flex gap-3 mb-3">
                      <div className="h-3 w-16 bg-neutral-100 rounded" />
                      <div className="h-3 w-12 bg-neutral-100 rounded" />
                      <div className="h-3 w-14 bg-neutral-100 rounded" />
                    </div>
                    <div className="border-t border-neutral-100 pt-2 flex justify-between">
                      <div className="h-3 w-16 bg-neutral-100 rounded" />
                      <div className="h-3 w-12 bg-neutral-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-neutral-400" />
                </div>
                <p className="font-semibold text-sm text-black mb-1">검색 결과가 없습니다</p>
                <p className="text-xs text-neutral-400">다른 키워드를 시도해보세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.essay_id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                  >
                    <Link href={`/library/${item.essay_id}`}>
                      <div className="border border-neutral-200 rounded-xl bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 text-neutral-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-black leading-tight">{item.company}</h3>
                              <p className="text-xs text-neutral-400">{item.role}</p>
                            </div>
                          </div>
                          <OrgBadge type={item.org_type} />
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.year} {item.season}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {item.hire_type}
                          </span>
                          {item.university && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {item.university}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                          <span className="flex items-center gap-1 text-xs text-neutral-400">
                            <FileText className="w-3 h-3" />
                            {item.qna_count}개 문항
                          </span>
                          <span className="text-[10px] text-neutral-300">{item.source}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => updateParams({ page: String(Math.max(1, qPage - 1)) })}
                  disabled={qPage === 1}
                  className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-neutral-500" />
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 7) p = i + 1;
                  else if (qPage <= 4) p = i + 1;
                  else if (qPage >= totalPages - 3) p = totalPages - 6 + i;
                  else p = qPage - 3 + i;
                  return (
                    <button
                      key={p}
                      onClick={() => updateParams({ page: String(p) })}
                      className="w-8 h-8 rounded-lg text-xs font-medium transition-colors"
                      style={qPage === p
                        ? { background: "#2563eb", color: "white" }
                        : { color: "#737373" }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => updateParams({ page: String(Math.min(totalPages, qPage + 1)) })}
                  disabled={qPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center disabled:opacity-30 hover:bg-neutral-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
