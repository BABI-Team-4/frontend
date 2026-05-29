"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Star, Eye, TrendingUp, ArrowUpRight } from "lucide-react";

type Category = "전체" | "IT/SW" | "금융" | "제조" | "컨설팅" | "공기업";

const CATEGORIES: Category[] = ["전체", "IT/SW", "금융", "제조", "컨설팅", "공기업"];

const LETTERS = [
  { id: 1, company: "삼성전자", position: "SW 개발", year: 2024, season: "상반기", category: "IT/SW" as Category, tags: ["SW개발", "문제해결", "협업"], score: 96, views: 8421, bookmarks: 2341, excerpt: "저는 어릴 적부터 기술이 일상을 변화시키는 순간에 매료되어 왔습니다. 삼성전자의 갤럭시 AI가 수억 명의 생활 방식을 바꾸는 것처럼, 저도 그 변화의 중심에 서고 싶습니다..." },
  { id: 2, company: "카카오", position: "백엔드 개발자", year: 2024, season: "하반기", category: "IT/SW" as Category, tags: ["백엔드", "데이터기반", "문제해결"], score: 93, views: 6287, bookmarks: 1892, excerpt: "일 평균 5천만 명이 사용하는 서비스의 안정성을 책임지는 개발자가 되고 싶습니다..." },
  { id: 3, company: "KB국민은행", position: "IT 개발직", year: 2024, season: "상반기", category: "금융" as Category, tags: ["금융IT", "보안", "협업"], score: 91, views: 4521, bookmarks: 1234, excerpt: "디지털 금융 혁신의 선두에 서고자 지원합니다..." },
  { id: 4, company: "현대자동차", position: "연구개발직", year: 2024, season: "하반기", category: "제조" as Category, tags: ["R&D", "자율주행", "리더십"], score: 89, views: 3854, bookmarks: 987, excerpt: "E-GMP 플랫폼 기반의 전동화 전략을 공부하며..." },
  { id: 5, company: "McKinsey", position: "컨설턴트", year: 2023, season: "하반기", category: "컨설팅" as Category, tags: ["전략", "분석력", "커뮤니케이션"], score: 97, views: 7123, bookmarks: 2567, excerpt: "복잡한 문제를 데이터 기반으로 분해하고, 명확한 인사이트를 도출하는 것이 제 핵심 역량입니다..." },
  { id: 6, company: "한국전력공사", position: "IT 직렬", year: 2024, season: "상반기", category: "공기업" as Category, tags: ["공기업", "IT인프라", "안정성"], score: 88, views: 5234, bookmarks: 1456, excerpt: "대한민국 에너지 안보의 핵심 인프라를 운영하는 한국전력에서..." },
  { id: 7, company: "네이버", position: "프론트엔드", year: 2024, season: "상반기", category: "IT/SW" as Category, tags: ["프론트엔드", "UX", "협업"], score: 92, views: 5891, bookmarks: 1678, excerpt: "사용자가 '왜 이렇게 편리하지?'라고 느끼는 순간을 만드는 것이 저의 개발 철학입니다..." },
  { id: 8, company: "LG에너지솔루션", position: "배터리 개발", year: 2024, season: "하반기", category: "제조" as Category, tags: ["배터리", "R&D", "글로벌"], score: 90, views: 3241, bookmarks: 876, excerpt: "전기차 전환의 핵심 열쇠는 배터리입니다..." },
];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("전체");
  const [sortBy, setSortBy] = useState<"views" | "score" | "bookmarks">("views");

  const filtered = LETTERS.filter((l) => {
    const matchCat = category === "전체" || l.category === category;
    const matchSearch = search === "" || l.company.includes(search) || l.position.includes(search) || l.tags.some((t) => t.includes(search));
    return matchCat && matchSearch;
  }).sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 px-8 py-4 border-b bg-white border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-black">합격 자소서 라이브러리</h1>
              <p className="text-sm mt-0.5 text-neutral-500">실제 합격자들의 자기소개서를 분석하고 내 것으로 만들어보세요</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input placeholder="기업명, 직무 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-56 text-sm" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="h-9 px-3 text-sm rounded-xl border outline-none cursor-pointer border-neutral-200 bg-white text-neutral-700"
              >
                <option value="views">조회수 순</option>
                <option value="score">점수 순</option>
                <option value="bookmarks">북마크 순</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={category === cat
                  ? { background: "#2563eb", color: "white" }
                  : { background: "#f5f5f5", color: "#737373" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-5 mb-8">
            {[
              { label: "총 자소서 수", value: "3.2만+", icon: BookOpen },
              { label: "평균 합격 점수", value: "91점", icon: Star },
              { label: "이번 주 신규", value: "247건", icon: TrendingUp },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <Card className="border border-neutral-200 shadow-none">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-black">{s.value}</p>
                        <p className="text-xs text-neutral-500">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-5">
            {filtered.map((letter, i) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card className="border border-neutral-200 shadow-none hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-black">{letter.company}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                            {letter.year} {letter.season}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">{letter.position}</p>
                      </div>
                      <div className="flex flex-col items-center px-3 py-2 rounded-full bg-neutral-100">
                        <span className="font-display text-xl leading-none text-black">{letter.score}</span>
                        <span className="text-xs mt-0.5 text-neutral-500">점</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {letter.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{tag}</span>
                      ))}
                    </div>

                    <p className="text-xs leading-relaxed line-clamp-2 mb-4 text-neutral-500">{letter.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{letter.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{letter.bookmarks.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/similarity">
                          <button className="text-xs px-3 py-1.5 rounded-full font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors">
                            유사도 비교
                          </button>
                        </Link>
                        <Link href="/editor">
                          <button className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 text-white hover:opacity-90 transition-opacity" style={{ background: "#2563eb" }}>
                            참고하기 <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="font-semibold mb-1 text-black">검색 결과가 없습니다</p>
              <p className="text-sm text-neutral-500">다른 키워드나 카테고리를 시도해보세요</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
