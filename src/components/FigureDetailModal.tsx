import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Bookmark, Check, Copy, FileText, X } from 'lucide-react';
import { FigureEntry, ThemeMeta } from '../data/types';
import { buildEssayParagraph } from '../utils/studyLogic';

interface FigureDetailModalProps {
  figure: FigureEntry | null;
  themeMeta?: ThemeMeta;
  crossThemeTarget?: FigureEntry | null;
  isBookmarked: boolean;
  isMastered: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onToggleMastered: (id: string) => void;
  onSelectDseYear: (year: string) => void;
  onOpenFigure?: (fig: FigureEntry) => void;
}

export const FigureDetailModal: React.FC<FigureDetailModalProps> = ({
  figure,
  themeMeta,
  crossThemeTarget,
  isBookmarked,
  isMastered,
  onClose,
  onToggleBookmark,
  onToggleMastered,
  onSelectDseYear,
  onOpenFigure,
}) => {
  const [paragraphMode, setParagraphMode] = useState<'dialectical' | 'positive'>('dialectical');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!figure) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [figure, onClose]);

  if (!figure) return null;

  const generatedParagraph = buildEssayParagraph(figure, paragraphMode);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 backdrop-blur-xs p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="figure-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Archival Header Bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#F3EFE6] border-b border-[#D6CEBE] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#57534E] font-mono tabular-nums">
            <span>主題 {figure.themeNumber}：{themeMeta?.title}</span>
            <span aria-hidden="true">·</span>
            <span>編號 {String(figure.orderInTheme).padStart(2, '0')}</span>
            <span aria-hidden="true">·</span>
            <span>{figure.eraOrRegion}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleMastered(figure.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isMastered
                  ? 'bg-[#14532D] text-white border-[#14532D]'
                  : 'bg-white text-[#292524] border-[#D6CEBE] hover:bg-[#EBE6DF]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isMastered ? '已掌握人物' : '標記已掌握'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(figure.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isBookmarked
                  ? 'bg-[#9A3412] text-white border-[#9A3412]'
                  : 'bg-white text-[#292524] border-[#D6CEBE] hover:bg-[#EBE6DF]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isBookmarked ? '已收入例子簿' : '收入例子簿'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="關閉人物詳情視窗"
              className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-lg hover:bg-[#EBE6DF] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8">
          {/* Title & Bio */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2
                id="figure-modal-title"
                className="text-3xl md:text-4xl font-bold text-[#1C1917] tracking-tight"
              >
                {figure.name}
              </h2>
              <span className="text-sm text-[#78350F] font-medium">
                一例多用：{figure.multiUse}
              </span>
            </div>
            <p className="mt-3 text-base text-[#44403C] leading-relaxed">
              {figure.bio}
            </p>
            {crossThemeTarget && onOpenFigure && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onOpenFigure(crossThemeTarget)}
                  className="px-3 py-1.5 text-xs font-medium bg-[#F3EFE6] hover:bg-[#1C1917] text-[#1C1917] hover:text-white border border-[#D6CEBE] rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>跨單元連結：查看「{crossThemeTarget.name}」於主題 {crossThemeTarget.themeNumber} 的完整生平事跡</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quotes Section (Pull Quote Style, No Thick Left Border) */}
          <div className="py-5 px-6 bg-[#F3EFE6]/80 border border-[#D6CEBE] rounded-lg">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-semibold tracking-wider text-[#78350F]">
                {figure.quoteLabel}（議論文引用金句）
              </span>
              <button
                type="button"
                onClick={() => handleCopy(figure.quotes.join('；'), 'quote')}
                className="px-2.5 py-1 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-white border border-[#D6CEBE] rounded-md flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                {copiedKey === 'quote' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#14532D]" />
                    <span>已複製名言</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製名言</span>
                  </>
                )}
              </button>
            </div>
            <div className="space-y-2">
              {figure.quotes.map((q, idx) => (
                <p
                  key={idx}
                  className="text-lg md:text-xl font-editorial font-semibold text-[#1C1917] leading-relaxed"
                >
                  {q}
                </p>
              ))}
            </div>
          </div>

          {/* Deeds & Core Thesis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Chronological Deeds */}
            <div className="lg:col-span-7 bg-white border border-[#E7E2D8] rounded-lg p-5">
              <h3 className="text-base font-bold text-[#1C1917] pb-3 mb-4 border-b border-[#E7E2D8] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#9A3412]" />
                <span>生平核心事跡（敘例素材）</span>
              </h3>
              <ol className="space-y-3 text-sm text-[#292524] leading-relaxed">
                {figure.deeds.map((deed, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-xs font-semibold text-[#9A3412] mt-0.5 tabular-nums shrink-0">
                      0{idx + 1}.
                    </span>
                    <span>{deed}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right 5 cols: Core Arguments */}
            <div className="lg:col-span-5 bg-white border border-[#E7E2D8] rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] pb-3 mb-4 border-b border-[#E7E2D8]">
                  總論點／核心立論切入
                </h3>
                <ul className="space-y-3 text-sm text-[#1C1917] font-medium leading-relaxed">
                  {figure.coreArguments.map((arg, idx) => (
                    <li key={idx} className="p-3 bg-[#FBF9F5] border border-[#EBE6DF] rounded-md">
                      {arg}
                    </li>
                  ))}
                </ul>
              </div>

              {/* DSE Past Paper Year Filter Links */}
              <div className="mt-6 pt-4 border-t border-[#E7E2D8]">
                <span className="block text-xs text-[#57534E] mb-2">
                  點擊年份查看同題適用人物：
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {figure.dseYears.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        onSelectDseYear(yr);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-mono font-medium bg-[#F3EFE6] hover:bg-[#9A3412] text-[#292524] hover:text-white rounded-md transition-colors tabular-nums whitespace-nowrap shrink-0"
                    >
                      DSE {yr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Positive vs Counter Arguments Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E7E2D8] rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7E2D8]">
                <h3 className="text-base font-bold text-[#14532D]">
                  正面論證（分論點推演）
                </h3>
                <span className="text-xs text-[#57534E]">支持中心論點</span>
              </div>
              <ul className="space-y-3 text-sm text-[#292524] leading-relaxed">
                {figure.positiveArguments.map((arg, idx) => (
                  <li key={idx}>{arg}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-[#E7E2D8] rounded-lg p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E7E2D8]">
                <h3 className="text-base font-bold text-[#9A3412]">
                  駁論／反面思考（高階思辨）
                </h3>
                <span className="text-xs text-[#57534E]">防範立論絕對化</span>
              </div>
              <ul className="space-y-3 text-sm text-[#292524] leading-relaxed">
                {figure.counterArguments.map((arg, idx) => (
                  <li key={idx}>{arg}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Practical Essay Paragraph Generator */}
          <div className="bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#9A3412]" />
                <h3 className="text-base font-bold text-[#1C1917]">
                  議論文實戰示範段落（一鍵套用結構）
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-[#EBE6DF] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setParagraphMode('dialectical')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      paragraphMode === 'dialectical'
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    正反思辨段落（5** 推薦）
                  </button>
                  <button
                    type="button"
                    onClick={() => setParagraphMode('positive')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      paragraphMode === 'positive'
                        ? 'bg-white text-[#1C1917] shadow-xs'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    精簡正面論證
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(generatedParagraph, 'para')}
                  className="px-3 py-1.5 text-xs font-medium bg-[#1C1917] text-white hover:bg-[#292524] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedKey === 'para' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>已複製段落</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>複製示範段落</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <pre className="whitespace-pre-wrap font-sans text-sm text-[#1C1917] bg-white p-4 rounded-lg border border-[#D6CEBE] leading-relaxed">
              {generatedParagraph}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
