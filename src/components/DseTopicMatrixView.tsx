import React, { useState } from 'react';
import { ArrowRight, BookOpen, Compass, FileEdit } from 'lucide-react';
import { DSE_TOPIC_GUIDES } from '../data/dseTopics';
import { DseTopicGuide, FigureEntry } from '../data/types';
import { stripLeadingBullet } from '../utils/studyLogic';

interface DseTopicMatrixViewProps {
  figures: FigureEntry[];
  selectedYear: string;
  onSelectYear: (year: string) => void;
  onOpenFigure: (figure: FigureEntry) => void;
  onJumpToEssayBuilder: (year: string) => void;
}

export const DseTopicMatrixView: React.FC<DseTopicMatrixViewProps> = ({
  figures,
  selectedYear,
  onSelectYear,
  onOpenFigure,
  onJumpToEssayBuilder,
}) => {
  const activeGuide: DseTopicGuide =
    DSE_TOPIC_GUIDES.find((g) => g.year === selectedYear) || DSE_TOPIC_GUIDES[0];

  const positiveFigures = activeGuide.recommendedPositiveIds
    .map((id) => figures.find((f) => f.id === id))
    .filter((f): f is FigureEntry => Boolean(f));

  const counterFigures = activeGuide.recommendedCounterIds
    .map((id) => figures.find((f) => f.id === id))
    .filter((f): f is FigureEntry => Boolean(f));

  const allMatchingFigures = figures.filter((f) => f.dseYears.includes(activeGuide.year));

  return (
    <section className="space-y-8" aria-label="DSE 歷屆試題與一例多用樞紐">
      {/* Year Selector Bar */}
      <div className="bg-white border border-[#D6CEBE] rounded-xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1917]">
              DSE 歷屆及模擬試題「一例多用」攻防矩陣
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              選擇年份題目，即可查閱該題的核心審題張力、老師評卷提點，以及正面立論與反面駁論的最佳人物配搭。
            </p>
          </div>
          <span className="text-xs font-mono text-[#78350F] tabular-nums">
            共收錄 {DSE_TOPIC_GUIDES.length} 個核心年份命題 · 當前題目適用人物 {allMatchingFigures.length} 位
          </span>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 pt-2"
          role="tablist"
          aria-label="選擇 DSE 試題年份"
        >
          {DSE_TOPIC_GUIDES.map((guide) => {
            const isSelected = guide.year === activeGuide.year;
            return (
              <button
                key={guide.year}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectYear(guide.year)}
                className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  isSelected
                    ? 'bg-[#1C1917] text-white border-[#1C1917]'
                    : 'bg-[#FBF9F5] text-[#292524] border-[#D6CEBE] hover:bg-[#EBE6DF]'
                }`}
              >
                {guide.year} 題
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Topic Analysis Card */}
      <div className="bg-white border border-[#D6CEBE] rounded-xl p-6 md:p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[#E7E2D8]">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#9A3412] tabular-nums">
              <span>DSE {activeGuide.year} 核心命題剖析</span>
              <span aria-hidden="true">·</span>
              <span>對應單元：{activeGuide.themeId.replace('theme-', '主題 ')}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#1C1917]">
              {activeGuide.title}
            </h3>
            <p className="text-base text-[#44403C] leading-relaxed">
              <strong className="text-[#1C1917]">審題核心張力：</strong>
              {activeGuide.coreTension}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onJumpToEssayBuilder(activeGuide.year)}
            className="px-4 py-2.5 text-xs font-medium bg-[#9A3412] text-white hover:bg-[#7C2D12] rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <FileEdit className="w-4 h-4" />
            <span>以此題目建立議論文提綱</span>
          </button>
        </div>

        {/* Teacher's Marking Advice Box */}
        <div className="p-5 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-[#78350F] mb-2">
            <Compass className="w-4 h-4" />
            <span>中文科老師實戰立論與昇華指津</span>
          </div>
          <p className="text-sm md:text-base text-[#1C1917] leading-relaxed">
            {activeGuide.teacherAdvice}
          </p>
        </div>

        {/* Positive vs Counter Figures Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Positive Examples */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between pb-2 border-b border-[#E7E2D8]">
              <h4 className="text-lg font-bold text-[#14532D]">
                正面立論首選例子（建構中心分論點）
              </h4>
              <span className="text-xs text-[#57534E] font-mono tabular-nums">
                推薦 {positiveFigures.length} 例
              </span>
            </div>

            <div className="space-y-3">
              {positiveFigures.map((fig) => (
                <div
                  key={fig.id}
                  className="p-4 bg-[#FBF9F5] border border-[#E7E2D8] hover:border-[#9A3412] rounded-lg transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-[#1C1917]">
                        {fig.name}
                      </span>
                      <span className="text-xs text-[#57534E]">
                        {fig.eraOrRegion} · 主題 {fig.themeNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#78350F] font-medium mt-1">
                      核心切入：{stripLeadingBullet(fig.coreArguments[0] || '')}
                    </p>
                    <p className="text-sm text-[#44403C] mt-2 leading-relaxed">
                      {stripLeadingBullet(fig.positiveArguments[0] || '')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EBE6DF]">
                    <span className="text-xs text-[#57534E] truncate max-w-[240px]">
                      {fig.quotes[0]}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenFigure(fig)}
                      aria-label={`詳閱正面例子 ${fig.name} 的事跡與論證`}
                      className="text-xs font-medium text-[#9A3412] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <span>詳閱事跡與論證</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Counter / Dialectical Examples */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between pb-2 border-b border-[#E7E2D8]">
              <h4 className="text-lg font-bold text-[#9A3412]">
                駁論與反面思辨例子（衝擊 5** 深度）
              </h4>
              <span className="text-xs text-[#57534E] font-mono tabular-nums">
                推薦 {counterFigures.length} 例
              </span>
            </div>

            <div className="space-y-3">
              {counterFigures.map((fig) => (
                <div
                  key={fig.id}
                  className="p-4 bg-[#FBF9F5] border border-[#E7E2D8] hover:border-[#9A3412] rounded-lg transition-colors flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-bold text-[#1C1917]">
                        {fig.name}
                      </span>
                      <span className="text-xs text-[#57534E]">
                        {fig.eraOrRegion} · 主題 {fig.themeNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#9A3412] font-medium mt-1">
                      思辨切入：{stripLeadingBullet(fig.counterArguments[0] || '')}
                    </p>
                    <p className="text-sm text-[#44403C] mt-2 leading-relaxed">
                      事跡依據：{fig.deeds[0]}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EBE6DF]">
                    <span className="text-xs text-[#57534E] truncate max-w-[240px]">
                      {fig.multiUse}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenFigure(fig)}
                      aria-label={`詳閱駁論例子 ${fig.name} 的事跡與論證`}
                      className="text-xs font-medium text-[#9A3412] hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <span>詳閱事跡與論證</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Complete List of All Figures Tagged with this Year */}
        <div className="pt-6 border-t border-[#E7E2D8]">
          <h4 className="text-sm font-bold text-[#1C1917] mb-3">
            本冊所有標註適用「{activeGuide.year}」之人物索引（共 {allMatchingFigures.length} 位，點擊直接開啟卡片）：
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            {allMatchingFigures.map((fig) => (
              <button
                key={fig.id}
                type="button"
                onClick={() => onOpenFigure(fig)}
                className="px-3 py-1.5 text-xs font-medium bg-[#FBF9F5] hover:bg-[#1C1917] text-[#292524] hover:text-white border border-[#D6CEBE] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {fig.name}（{fig.eraOrRegion}）
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
