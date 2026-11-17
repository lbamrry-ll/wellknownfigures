import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Check,
  FileText,
  RotateCcw,
  Search,
} from 'lucide-react';
import { ALL_FIGURES, DSE_TOPIC_GUIDES, THEMES_META } from './data/dseTopics';
import { FigureEntry, ThemeId } from './data/types';
import {
  calculateMasteryStats,
  filterFigures,
  stripLeadingBullet,
} from './utils/studyLogic';
import { FigureDetailModal } from './components/FigureDetailModal';
import { DseTopicMatrixView } from './components/DseTopicMatrixView';
import { MemoryStudioView } from './components/MemoryStudioView';
import { EssayBuilderView } from './components/EssayBuilderView';
import { PdfHandoutModal } from './components/PdfHandoutModal';

type ActiveSection = 'archive' | 'matrix' | 'memory' | 'builder';

const STORAGE_BOOKMARKS_KEY = 'hkdse_chinese_figures_bookmarks_v1';
const STORAGE_MASTERED_KEY = 'hkdse_chinese_figures_mastered_v1';

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('archive');
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId | 'all'>('all');
  const [selectedDseYear, setSelectedDseYear] = useState<string | 'all'>('all');
  const [eraFilter, setEraFilter] = useState<'all' | 'ancient-cn' | 'modern-cn-hk' | 'world'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

  const [activeFigure, setActiveFigure] = useState<FigureEntry | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [matrixYear, setMatrixYear] = useState<string>('2026');
  const [builderYear, setBuilderYear] = useState<string>('2026');

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
      return saved ? JSON.parse(saved) : ['t1-1-kongzi', 't2-11-cheungkalong', 't5-1-lianpolinxiangru'];
    } catch {
      return ['t1-1-kongzi', 't2-11-cheungkalong', 't5-1-lianpolinxiangru'];
    }
  });

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MASTERED_KEY);
      return saved ? JSON.parse(saved) : ['t1-1-kongzi'];
    } catch {
      return ['t1-1-kongzi'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(bookmarkedIds));
    } catch {
      // ignore storage errors
    }
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MASTERED_KEY, JSON.stringify(masteredIds));
    } catch {
      // ignore storage errors
    }
  }, [masteredIds]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFigures = useMemo(
    () =>
      filterFigures(ALL_FIGURES, {
        themeId: selectedThemeId,
        dseYear: selectedDseYear,
        eraFilter,
        searchQuery,
        onlyBookmarked,
        bookmarkedIds,
      }),
    [selectedThemeId, selectedDseYear, eraFilter, searchQuery, onlyBookmarked, bookmarkedIds]
  );

  const masteryStats = useMemo(
    () => calculateMasteryStats(ALL_FIGURES.length, masteredIds, bookmarkedIds),
    [masteredIds, bookmarkedIds]
  );

  const currentThemeMeta = useMemo(
    () => THEMES_META.find((t) => t.id === selectedThemeId),
    [selectedThemeId]
  );

  const handleResetFilters = () => {
    setSelectedThemeId('all');
    setSelectedDseYear('all');
    setEraFilter('all');
    setSearchQuery('');
    setOnlyBookmarked(false);
  };

  const switchSection = (sec: ActiveSection) => {
    setActiveSection(sec);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 bg-[#FBF9F5]/95 backdrop-blur-xs border-b border-[#D6CEBE]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            switchSection('archive');
          }}
          className="text-lg font-bold tracking-tight text-[#1C1917] font-editorial whitespace-nowrap shrink-0"
        >
          文思百川 · DSE中文人物典藏
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="主導航列"
          className="flex items-center gap-4 md:gap-7 text-sm font-medium text-[#57534E] overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => switchSection('archive')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'archive'
                ? 'text-[#1C1917] font-semibold border-[#9A3412]'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            人物典藏庫
          </button>
          <button
            type="button"
            onClick={() => switchSection('matrix')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'matrix'
                ? 'text-[#1C1917] font-semibold border-[#9A3412]'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            歷屆試題樞紐
          </button>
          <button
            type="button"
            onClick={() => switchSection('memory')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'memory'
                ? 'text-[#1C1917] font-semibold border-[#9A3412]'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            記憶與背誦工坊
          </button>
          <button
            type="button"
            onClick={() => switchSection('builder')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeSection === 'builder'
                ? 'text-[#1C1917] font-semibold border-[#9A3412]'
                : 'border-transparent hover:text-[#1C1917]'
            }`}
          >
            議論文擬題室
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-[#1C1917] rounded-lg hover:bg-[#292524] transition-colors whitespace-nowrap shrink-0"
          >
            原版人物冊講義
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px baseline, generous editorial spacing) */}
      <main id="top" className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Institutional Hero & Operational Utility Bar */}
        <section className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="text-xs font-mono tracking-wider text-[#78350F] tabular-nums">
                香港中學文憑試中國語文科 · 卷二寫作能力 · 議論文例子與思辨教學專冊
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold text-[#1C1917] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                六大核心主題 · 78 則古今中外人物事跡與正反立論指南
              </h1>
              <p className="text-sm sm:text-base text-[#44403C] max-w-2xl leading-relaxed">
                從「生平事跡」與「經典名言」出發，掌握每位人物的「總論點」、「正面分論點」及「駁論／反面思考」，實現歷屆試題（2012–2026）一例多用，助你在考場寫出立論周延、有理有據的高分議論文。
              </p>
            </div>

            {/* Study Progress & Quick Action Panel */}
            <div className="lg:col-span-4 bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#57534E] font-mono tabular-nums">
                <span>溫習掌握進度：{masteryStats.masteredCount} / {masteryStats.totalFigures} 則</span>
                <span>例子簿收藏：{masteryStats.bookmarkedCount} 則</span>
              </div>

              <div className="w-full h-2 bg-[#EBE6DF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#14532D] transition-all duration-200"
                  style={{ width: `${Math.max(3, masteryStats.masteryPercentage)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveSection('memory')}
                  className="px-3 py-2 text-xs font-medium bg-[#9A3412] text-white hover:bg-[#7C2D12] rounded-lg transition-colors whitespace-nowrap shrink-0 text-center"
                >
                  開始名言與抽卡測驗
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('builder')}
                  className="px-3 py-2 text-xs font-medium bg-white text-[#1C1917] border border-[#D6CEBE] hover:bg-[#EBE6DF] rounded-lg transition-colors whitespace-nowrap shrink-0 text-center"
                >
                  打開我的例子簿 ({masteryStats.bookmarkedCount})
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: FIGURE ARCHIVE */}
        {activeSection === 'archive' && (
          <section className="space-y-6" aria-label="人物典藏庫">
            {/* Theme Selector Chapters (6 Themes from PDF) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedThemeId('all')}
                className={`p-3.5 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                  selectedThemeId === 'all'
                    ? 'bg-[#1C1917] text-white border-[#1C1917]'
                    : 'bg-white text-[#1C1917] border-[#D6CEBE] hover:bg-[#F3EFE6]'
                }`}
              >
                <span className="text-xs font-mono opacity-75 tabular-nums">ALL THEMES</span>
                <span className="text-sm font-bold mt-1">全部六大主題</span>
                <span className="text-xs opacity-80 mt-1 font-mono tabular-nums">
                  共 {ALL_FIGURES.length} 則條目
                </span>
              </button>

              {THEMES_META.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                const count = ALL_FIGURES.filter((f) => f.themeId === theme.id).length;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-3.5 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#9A3412] text-white border-[#9A3412]'
                        : 'bg-white text-[#1C1917] border-[#D6CEBE] hover:bg-[#F3EFE6]'
                    }`}
                  >
                    <span className="text-xs font-mono opacity-80 tabular-nums">
                      0{theme.number}. 主題單元
                    </span>
                    <span className="text-sm font-bold mt-1 truncate">{theme.title}</span>
                    <span className="text-xs opacity-85 mt-1 font-mono tabular-nums">
                      收錄 {count} 則
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Theme Banner Explanation */}
            {currentThemeMeta && (
              <div className="p-5 bg-white border border-[#D6CEBE] rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-[#9A3412]">
                    0{currentThemeMeta.number}. {currentThemeMeta.title} · 歷屆題目：{currentThemeMeta.subtitle}
                  </div>
                  <p className="text-base font-bold text-[#1C1917]">
                    核心思辨問題：{currentThemeMeta.coreQuestion}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedThemeId('all')}
                  className="px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg whitespace-nowrap shrink-0"
                >
                  顯示全部主題
                </button>
              </div>
            )}

            {/* Search & Multi-Dimensional Filter Bar */}
            <div className="bg-white border border-[#D6CEBE] rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <label htmlFor="figure-search-input" className="sr-only">
                    搜尋人物姓名、事跡、名言或論點關鍵字
                  </label>
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="figure-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜尋人物（如：孔子、張家朗、蘇格拉底）、名言或論點..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#9A3412]"
                  />
                </div>

                {/* Era / Region Segmented Control */}
                <div className="md:col-span-4 flex items-center gap-1 p-1 bg-[#F3EFE6] rounded-lg overflow-x-auto">
                  {(
                    [
                      { id: 'all', label: '全部時代' },
                      { id: 'ancient-cn', label: '中國古代' },
                      { id: 'modern-cn-hk', label: '現當代及香港' },
                      { id: 'world', label: '外國歷史與現代' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEraFilter(item.id)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex-1 ${
                        eraFilter === item.id
                          ? 'bg-white text-[#1C1917] shadow-xs'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* DSE Past Paper Year Filter Dropdown & Bookmarked Toggle */}
                <div className="md:col-span-3 flex items-center justify-end gap-2">
                  <label htmlFor="dse-year-filter" className="sr-only">
                    按 DSE 年份篩選
                  </label>
                  <select
                    id="dse-year-filter"
                    value={selectedDseYear}
                    onChange={(e) => setSelectedDseYear(e.target.value)}
                    className="px-3 py-2 text-xs font-medium bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917] flex-1"
                  >
                    <option value="all">所有 DSE 試題年份</option>
                    {DSE_TOPIC_GUIDES.map((g) => (
                      <option key={g.year} value={g.year}>
                        {g.year}：{g.title.slice(0, 12)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setOnlyBookmarked((b) => !b)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                      onlyBookmarked
                        ? 'bg-[#9A3412] text-white border-[#9A3412]'
                        : 'bg-[#FBF9F5] text-[#292524] border-[#D6CEBE] hover:bg-[#EBE6DF]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>例子簿</span>
                  </button>
                </div>
              </div>

              {/* Filter Status & Reset Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EBE6DF] text-xs text-[#57534E]">
                <div className="font-mono tabular-nums">
                  共找到 <strong className="text-[#1C1917]">{filteredFigures.length}</strong> 則符合條件的人物事跡與立論條目
                </div>
                {(selectedThemeId !== 'all' ||
                  selectedDseYear !== 'all' ||
                  eraFilter !== 'all' ||
                  searchQuery !== '' ||
                  onlyBookmarked) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-medium text-[#9A3412] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>重設所有篩選條件</span>
                  </button>
                )}
              </div>
            </div>

            {/* Empty State */}
            {filteredFigures.length === 0 ? (
              <div className="bg-white border border-[#D6CEBE] rounded-xl p-12 text-center space-y-4">
                <p className="text-lg font-bold text-[#1C1917]">
                  找不到符合當前篩選條件的人物條目
                </p>
                <p className="text-sm text-[#57534E]">
                  請嘗試清除搜尋字詞或切換至「全部六大主題」。
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-medium bg-[#1C1917] text-white rounded-lg hover:bg-[#292524]"
                >
                  重設所有篩選條件
                </button>
              </div>
            ) : (
              /* Figure Cards Grid (Single-Elevation, Clean Unboxed Metadata, No Thick Left Borders) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFigures.map((fig) => {
                  const isBookmarked = bookmarkedIds.includes(fig.id);
                  const isMastered = masteredIds.includes(fig.id);
                  const themeObj = THEMES_META.find((t) => t.id === fig.themeId);

                  return (
                    <article
                      key={fig.id}
                      className="bg-white border border-[#D6CEBE] hover:border-[#9A3412] rounded-xl p-6 flex flex-col justify-between transition-colors"
                    >
                      <div className="space-y-4">
                        {/* Quiet 1-line unboxed text kicker with typographic separators */}
                        <div className="flex items-center justify-between gap-2 text-xs text-[#57534E]">
                          <div className="flex items-center gap-1.5 font-mono tabular-nums truncate">
                            <span>主題 {fig.themeNumber}</span>
                            <span aria-hidden="true">·</span>
                            <span>{themeObj?.title}</span>
                            <span aria-hidden="true">·</span>
                            <span>{fig.eraOrRegion}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleMastered(fig.id)}
                              aria-label={
                                isMastered
                                  ? `取消標記已掌握 ${fig.name}`
                                  : `標記已掌握 ${fig.name}`
                              }
                              className={`p-1.5 rounded-md border transition-colors ${
                                isMastered
                                  ? 'bg-[#14532D] text-white border-[#14532D]'
                                  : 'bg-[#FBF9F5] text-[#57534E] border-[#E7E2D8] hover:text-[#1C1917]'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleBookmark(fig.id)}
                              aria-label={
                                isBookmarked
                                  ? `從例子簿移除 ${fig.name}`
                                  : `將 ${fig.name} 加入例子簿`
                              }
                              className={`p-1.5 rounded-md border transition-colors ${
                                isBookmarked
                                  ? 'bg-[#9A3412] text-white border-[#9A3412]'
                                  : 'bg-[#FBF9F5] text-[#57534E] border-[#E7E2D8] hover:text-[#1C1917]'
                              }`}
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Primary Figure Name & Bio */}
                        <div>
                          <h3 className="text-xl font-bold text-[#1C1917] tracking-tight">
                            <button
                              type="button"
                              onClick={() => setActiveFigure(fig)}
                              className="text-left hover:text-[#9A3412] transition-colors"
                            >
                              {fig.name}
                            </button>
                          </h3>
                          <p className="text-xs text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
                            {fig.bio}
                          </p>
                        </div>

                        {/* Core Thesis Box */}
                        <div className="p-3.5 bg-[#FBF9F5] border border-[#EBE6DF] rounded-lg space-y-1.5">
                          <div className="text-xs font-semibold text-[#78350F]">
                            核心論點切入
                          </div>
                          <p className="text-sm font-medium text-[#1C1917] leading-snug">
                            {stripLeadingBullet(fig.coreArguments[0] || '')}
                          </p>
                        </div>

                        {/* Deeds Preview */}
                        <div className="space-y-1.5 text-xs text-[#44403C] leading-relaxed">
                          <div className="font-semibold text-[#1C1917]">關鍵事跡：</div>
                          <p className="line-clamp-2">1. {fig.deeds[0]}</p>
                          {fig.deeds[1] && (
                            <p className="line-clamp-2">2. {fig.deeds[1]}</p>
                          )}
                        </div>

                        {/* Quote Preview */}
                        <div className="pt-2 border-t border-[#EBE6DF]">
                          <p className="text-xs font-editorial italic text-[#292524] line-clamp-2">
                            {fig.quoteLabel}：{fig.quotes.join(' · ')}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Multi-use metadata & Detail Action */}
                      <div className="mt-5 pt-3 border-t border-[#E7E2D8] flex items-center justify-between gap-2">
                        <span className="text-xs text-[#78350F] truncate">
                          {fig.multiUse}
                        </span>

                        <button
                          type="button"
                          onClick={() => setActiveFigure(fig)}
                          aria-label={`詳閱 ${fig.name} 的正反論證`}
                          className="px-3 py-1.5 text-xs font-medium bg-[#F3EFE6] hover:bg-[#1C1917] text-[#1C1917] hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          詳閱正反論證
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: DSE PAST PAPER MATRIX */}
        {activeSection === 'matrix' && (
          <DseTopicMatrixView
            figures={ALL_FIGURES}
            selectedYear={matrixYear}
            onSelectYear={setMatrixYear}
            onOpenFigure={setActiveFigure}
            onJumpToEssayBuilder={(yr) => {
              setBuilderYear(yr);
              setActiveSection('builder');
            }}
          />
        )}

        {/* SECTION 3: MEMORY & QUIZ STUDIO */}
        {activeSection === 'memory' && (
          <MemoryStudioView
            figures={ALL_FIGURES}
            masteredIds={masteredIds}
            onToggleMastered={handleToggleMastered}
            onOpenFigure={setActiveFigure}
          />
        )}

        {/* SECTION 4: ESSAY BUILDER & NOTEBOOK */}
        {activeSection === 'builder' && (
          <EssayBuilderView
            figures={ALL_FIGURES}
            initialYear={builderYear}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onOpenFigure={setActiveFigure}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-16 border-t border-[#D6CEBE] bg-[#F3EFE6] py-6 px-6">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#57534E]">
          <div>
            文思百川 · 香港中學文憑試（HKDSE）中國語文科議論文人物事蹟與正反立論教學平台
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="hover:text-[#1C1917] underline"
            >
              檢視原版 54 頁人物冊 PDF
            </button>
            <span aria-hidden="true">·</span>
            <span>收錄全六大主題共 {ALL_FIGURES.length} 則人物事跡</span>
          </div>
        </div>
      </footer>

      {/* Figure Detail Modal */}
      <FigureDetailModal
        figure={activeFigure}
        themeMeta={THEMES_META.find((t) => t.id === activeFigure?.themeId)}
        crossThemeTarget={
          activeFigure?.crossThemeRef
            ? ALL_FIGURES.find((f) => f.id === activeFigure.crossThemeRef) || null
            : null
        }
        isBookmarked={activeFigure ? bookmarkedIds.includes(activeFigure.id) : false}
        isMastered={activeFigure ? masteredIds.includes(activeFigure.id) : false}
        onClose={() => setActiveFigure(null)}
        onToggleBookmark={handleToggleBookmark}
        onToggleMastered={handleToggleMastered}
        onSelectDseYear={(yr) => {
          setSelectedDseYear(yr);
          switchSection('archive');
        }}
        onOpenFigure={setActiveFigure}
      />

      {/* Original PDF Handout Modal */}
      <PdfHandoutModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />
    </div>
  );
}
