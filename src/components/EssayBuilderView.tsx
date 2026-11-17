import React, { useEffect, useState } from 'react';
import { Bookmark, Check, Copy, Download, FileText, Plus, Trash2 } from 'lucide-react';
import { DSE_TOPIC_GUIDES } from '../data/dseTopics';
import { FigureEntry } from '../data/types';
import { buildFullEssayOutline, stripLeadingBullet } from '../utils/studyLogic';

interface EssayBuilderViewProps {
  figures: FigureEntry[];
  initialYear: string;
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onOpenFigure: (figure: FigureEntry) => void;
}

export const EssayBuilderView: React.FC<EssayBuilderViewProps> = ({
  figures,
  initialYear,
  bookmarkedIds,
  onToggleBookmark,
  onOpenFigure,
}) => {
  const [selectedYear, setSelectedYear] = useState<string>(initialYear || '2026');
  const [customStance, setCustomStance] = useState<string>('');
  const [selectedPositiveIds, setSelectedPositiveIds] = useState<string[]>([]);
  const [selectedCounterIds, setSelectedCounterIds] = useState<string[]>([]);
  const [copiedOutline, setCopiedOutline] = useState(false);

  const activeTopic =
    DSE_TOPIC_GUIDES.find((t) => t.year === selectedYear) || DSE_TOPIC_GUIDES[0];

  useEffect(() => {
    if (initialYear && DSE_TOPIC_GUIDES.some((t) => t.year === initialYear)) {
      setSelectedYear(initialYear);
    }
  }, [initialYear]);

  useEffect(() => {
    setSelectedPositiveIds(activeTopic.recommendedPositiveIds.slice(0, 2));
    setSelectedCounterIds(activeTopic.recommendedCounterIds.slice(0, 1));
    setCustomStance(activeTopic.coreTension);
  }, [activeTopic.year]);

  const candidateFigures = figures.filter(
    (f) =>
      f.dseYears.includes(activeTopic.year) ||
      activeTopic.recommendedPositiveIds.includes(f.id) ||
      activeTopic.recommendedCounterIds.includes(f.id) ||
      bookmarkedIds.includes(f.id)
  );

  const positiveFigures = selectedPositiveIds
    .map((id) => figures.find((f) => f.id === id))
    .filter((f): f is FigureEntry => Boolean(f));

  const counterFigures = selectedCounterIds
    .map((id) => figures.find((f) => f.id === id))
    .filter((f): f is FigureEntry => Boolean(f));

  const bookmarkedFigures = figures.filter((f) => bookmarkedIds.includes(f.id));

  const generatedOutline = buildFullEssayOutline(
    activeTopic,
    positiveFigures,
    counterFigures,
    customStance
  );

  const togglePositive = (id: string) => {
    setSelectedPositiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCounter = (id: string) => {
    setSelectedCounterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCopyOutline = () => {
    navigator.clipboard?.writeText(generatedOutline);
    setCopiedOutline(true);
    setTimeout(() => setCopiedOutline(false), 1800);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generatedOutline], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DSE-${activeTopic.year}-議論文提綱.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-8" aria-label="議論文擬題室與我的例子簿">
      {/* Top Section: My Bookmarked Figures Notebook */}
      <div className="bg-white border border-[#D6CEBE] rounded-xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
          <div>
            <h2 className="text-xl font-bold text-[#1C1917]">
              我的溫習例子簿（跨主題重點人物收藏）
            </h2>
            <p className="text-sm text-[#57534E] mt-1">
              在人物典藏庫點擊書籤即可將人物收入此處，方便考前快速溫習與一鍵加入下方提綱。
            </p>
          </div>
          <span className="text-xs font-mono text-[#9A3412] tabular-nums">
            已收藏 {bookmarkedFigures.length} 位人物
          </span>
        </div>

        {bookmarkedFigures.length === 0 ? (
          <p className="text-sm text-[#57534E] py-4">
            目前尚未收藏人物。你可在「人物典藏庫」或人物詳情視窗點擊「收入例子簿」加入常用例子。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            {bookmarkedFigures.map((fig) => (
              <div
                key={fig.id}
                className="p-3.5 bg-[#FBF9F5] border border-[#E7E2D8] rounded-lg flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenFigure(fig)}
                      className="text-sm font-bold text-[#1C1917] hover:text-[#9A3412] text-left"
                    >
                      {fig.name}（{fig.eraOrRegion}）
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(fig.id)}
                      aria-label={`從例子簿移除 ${fig.name}`}
                      className="text-[#78716C] hover:text-[#991B1B] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#57534E] mt-1 line-clamp-2">
                    {stripLeadingBullet(fig.coreArguments[0] || '')}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#EBE6DF]">
                  <button
                    type="button"
                    onClick={() => togglePositive(fig.id)}
                    className={`px-2 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 ${
                      selectedPositiveIds.includes(fig.id)
                        ? 'bg-[#14532D] text-white border-[#14532D]'
                        : 'bg-white text-[#292524] border-[#D6CEBE]'
                    }`}
                  >
                    + 正面論證
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCounter(fig.id)}
                    className={`px-2 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 ${
                      selectedCounterIds.includes(fig.id)
                        ? 'bg-[#9A3412] text-white border-[#9A3412]'
                        : 'bg-white text-[#292524] border-[#D6CEBE]'
                    }`}
                  >
                    + 駁論反思
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Essay Outline Builder Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Controls & Figure Selection */}
        <div className="lg:col-span-6 bg-white border border-[#D6CEBE] rounded-xl p-6 space-y-6">
          <div>
            <label
              htmlFor="essay-topic-select"
              className="block text-sm font-bold text-[#1C1917] mb-2"
            >
              步驟一：選擇議論文題目（2012–2026 DSE 試題）
            </label>
            <select
              id="essay-topic-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917] font-medium"
            >
              {DSE_TOPIC_GUIDES.map((g) => (
                <option key={g.year} value={g.year}>
                  {g.year} DSE：{g.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="custom-stance-input"
              className="block text-sm font-bold text-[#1C1917] mb-2"
            >
              步驟二：設定中心論點／審題立意（可自行修改）
            </label>
            <textarea
              id="custom-stance-input"
              rows={2}
              value={customStance}
              onChange={(e) => setCustomStance(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917]"
              placeholder="輸入你的中心論點..."
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-sm font-bold text-[#1C1917]">
                步驟三：點選加入「正面論證」或「駁論思辨」人物
              </span>
              <span className="text-xs text-[#57534E] font-mono tabular-nums">
                候選 {candidateFigures.length} 人
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {candidateFigures.map((fig) => {
                const inPos = selectedPositiveIds.includes(fig.id);
                const inCounter = selectedCounterIds.includes(fig.id);
                return (
                  <div
                    key={fig.id}
                    className="p-3 bg-[#FBF9F5] border border-[#E7E2D8] rounded-lg flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenFigure(fig)}
                          className="text-sm font-bold text-[#1C1917] hover:text-[#9A3412] truncate"
                        >
                          {fig.name}
                        </button>
                        <span className="text-xs text-[#57534E] shrink-0">
                          {fig.eraOrRegion}
                        </span>
                      </div>
                      <p className="text-xs text-[#44403C] truncate mt-0.5">
                        {stripLeadingBullet(fig.coreArguments[0] || '')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => togglePositive(fig.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                          inPos
                            ? 'bg-[#14532D] text-white border-[#14532D]'
                            : 'bg-white text-[#292524] border-[#D6CEBE] hover:bg-[#EBE6DF]'
                        }`}
                      >
                        {inPos ? '✓ 正例' : '+ 正例'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCounter(fig.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                          inCounter
                            ? 'bg-[#9A3412] text-white border-[#9A3412]'
                            : 'bg-white text-[#292524] border-[#D6CEBE] hover:bg-[#EBE6DF]'
                        }`}
                      >
                        {inCounter ? '✓ 駁論' : '+ 駁論'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Live Generated Outline Preview */}
        <div className="lg:col-span-6 bg-[#F3EFE6] border border-[#D6CEBE] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D6CEBE]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#9A3412]" />
              <h3 className="text-base font-bold text-[#1C1917]">
                即時生成議論文結構提綱（正反兼備）
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyOutline}
                className="px-3 py-1.5 text-xs font-medium bg-white text-[#1C1917] border border-[#D6CEBE] hover:bg-[#EBE6DF] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                {copiedOutline ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#14532D]" />
                    <span>已複製提綱</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製全文</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-1.5 text-xs font-medium bg-[#1C1917] text-white hover:bg-[#292524] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下載提綱 (.txt)</span>
              </button>
            </div>
          </div>

          <pre className="flex-1 whitespace-pre-wrap font-sans text-xs md:text-sm text-[#1C1917] bg-white p-5 rounded-lg border border-[#D6CEBE] leading-relaxed overflow-y-auto max-h-[520px]">
            {generatedOutline}
          </pre>
        </div>
      </div>
    </section>
  );
};
