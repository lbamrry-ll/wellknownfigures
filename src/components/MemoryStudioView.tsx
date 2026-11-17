import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import { CLOZE_QUESTIONS } from '../data/dseTopics';
import { FigureEntry } from '../data/types';
import { stripLeadingBullet } from '../utils/studyLogic';

interface MemoryStudioViewProps {
  figures: FigureEntry[];
  masteredIds: string[];
  onToggleMastered: (id: string) => void;
  onOpenFigure: (figure: FigureEntry) => void;
}

type StudioSubMode = 'cloze' | 'flashcards' | 'matcher';

export const MemoryStudioView: React.FC<MemoryStudioViewProps> = ({
  figures,
  masteredIds,
  onToggleMastered,
  onOpenFigure,
}) => {
  const [subMode, setSubMode] = useState<StudioSubMode>('cloze');

  // --- Mode 1: Cloze Quiz State ---
  const [clozeIndex, setClozeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [clozeCorrectCount, setClozeCorrectCount] = useState(0);
  const [clozeAnsweredCount, setClozeAnsweredCount] = useState(0);

  const currentCloze = CLOZE_QUESTIONS[clozeIndex];
  const matchedClozeFigure = figures.find((f) => f.id === currentCloze.figureId);

  const handleSelectClozeOption = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    setClozeAnsweredCount((c) => c + 1);
    if (option === currentCloze.answer) {
      setClozeCorrectCount((c) => c + 1);
    }
  };

  const handleNextCloze = () => {
    setSelectedOption(null);
    setClozeIndex((i) => (i + 1) % CLOZE_QUESTIONS.length);
  };

  const handleResetCloze = () => {
    setSelectedOption(null);
    setClozeIndex(0);
    setClozeCorrectCount(0);
    setClozeAnsweredCount(0);
  };

  // --- Mode 2: Flashcards State ---
  const [flashcardThemeFilter, setFlashcardThemeFilter] = useState<string>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredDeck = useMemo(() => {
    if (flashcardThemeFilter === 'all') return figures;
    return figures.filter((f) => f.themeId === flashcardThemeFilter);
  }, [figures, flashcardThemeFilter]);

  const safeCardIndex = cardIndex % Math.max(1, filteredDeck.length);
  const currentCard = filteredDeck[safeCardIndex] || figures[0];
  const isCurrentCardMastered = masteredIds.includes(currentCard.id);

  // --- Mode 3: Argument-to-Figure Matcher State ---
  const matcherQuestions = useMemo(() => {
    const selectedIndices = [0, 2, 5, 8, 15, 16, 21, 28, 31, 41, 44, 55, 59, 68, 72];
    return selectedIndices
      .map((idx) => figures[idx])
      .filter((f): f is FigureEntry => Boolean(f))
      .map((targetFig, i) => {
        const distractors = figures
          .filter((f) => f.id !== targetFig.id && f.name !== targetFig.name)
          .slice(i * 3, i * 3 + 3);
        const options = [targetFig, ...distractors].sort((a, b) => a.id.localeCompare(b.id));
        return {
          targetFig,
          thesisPrompt: stripLeadingBullet(targetFig.coreArguments[0] || ''),
          counterPrompt: stripLeadingBullet(targetFig.counterArguments[0] || ''),
          options,
        };
      });
  }, [figures]);

  const [matcherIndex, setMatcherIndex] = useState(0);
  const [matcherPickId, setMatcherPickId] = useState<string | null>(null);
  const [matcherScore, setMatcherScore] = useState(0);

  const currentMatcher = matcherQuestions[matcherIndex % matcherQuestions.length];

  const handleSelectMatcher = (figId: string) => {
    if (matcherPickId !== null) return;
    setMatcherPickId(figId);
    if (figId === currentMatcher.targetFig.id) {
      setMatcherScore((s) => s + 1);
    }
  };

  const handleNextMatcher = () => {
    setMatcherPickId(null);
    setMatcherIndex((idx) => (idx + 1) % matcherQuestions.length);
  };

  return (
    <section className="space-y-8" aria-label="記憶與背誦工坊">
      {/* Studio Header & Mode Switcher */}
      <div className="bg-white border border-[#D6CEBE] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1917]">
            人物事跡、名言與正反立論記憶工坊
          </h2>
          <p className="text-sm text-[#57534E] mt-1">
            透過「名言填空」、「正反論證閃卡」與「審題立論配對」三種主動回憶訓練，考前牢記例子細節與思辨角度。
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg">
          <button
            type="button"
            onClick={() => setSubMode('cloze')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              subMode === 'cloze'
                ? 'bg-[#1C1917] text-white'
                : 'text-[#44403C] hover:text-[#1C1917]'
            }`}
          >
            1. 名言金句填空
          </button>
          <button
            type="button"
            onClick={() => setSubMode('flashcards')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              subMode === 'flashcards'
                ? 'bg-[#1C1917] text-white'
                : 'text-[#44403C] hover:text-[#1C1917]'
            }`}
          >
            2. 事跡與論點抽認卡
          </button>
          <button
            type="button"
            onClick={() => setSubMode('matcher')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              subMode === 'matcher'
                ? 'bg-[#1C1917] text-white'
                : 'text-[#44403C] hover:text-[#1C1917]'
            }`}
          >
            3. 論點與人物配對
          </button>
        </div>
      </div>

      {/* Mode 1: Quote Cloze Quiz */}
      {subMode === 'cloze' && (
        <div className="bg-white border border-[#D6CEBE] rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
            <div className="flex items-center gap-3 text-xs font-mono text-[#57534E] tabular-nums">
              <span>
                題目進度：{clozeIndex + 1} / {CLOZE_QUESTIONS.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                答對題數：{clozeCorrectCount} / {clozeAnsweredCount}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentCloze.themeTitle}</span>
            </div>

            <button
              type="button"
              onClick={handleResetCloze}
              className="px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新開始測驗</span>
            </button>
          </div>

          <div className="py-4 space-y-4">
            <div className="text-xs font-semibold text-[#9A3412]">
              人物：{currentCloze.figureName}（{currentCloze.eraOrRegion}）
            </div>

            <p className="text-xl md:text-2xl font-editorial font-semibold text-[#1C1917] leading-relaxed">
              {currentCloze.promptBefore}
              <span className="inline-block mx-2 px-4 py-0.5 border-b-2 border-[#9A3412] text-[#9A3412] font-bold">
                {selectedOption ? currentCloze.answer : '＿＿＿＿＿＿'}
              </span>
              {currentCloze.promptAfter}
            </p>

            <p className="text-sm text-[#57534E]">
              立論提示：{currentCloze.contextHint}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentCloze.options.map((option) => {
              const isPicked = selectedOption === option;
              const isAnswer = option === currentCloze.answer;

              let btnStyle =
                'bg-[#FBF9F5] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EBE6DF]';
              if (selectedOption !== null) {
                if (isAnswer) {
                  btnStyle = 'bg-[#14532D] text-white border-[#14532D]';
                } else if (isPicked && !isAnswer) {
                  btnStyle = 'bg-[#991B1B] text-white border-[#991B1B]';
                } else {
                  btnStyle = 'bg-[#FBF9F5] text-[#78716C] border-[#E7E2D8] opacity-60';
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectClozeOption(option)}
                  className={`p-4 text-left text-base font-medium rounded-lg border transition-colors flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span>{option}</span>
                  {selectedOption !== null && isAnswer && (
                    <span className="text-xs font-mono whitespace-nowrap shrink-0">
                      ✓ 正確答案
                    </span>
                  )}
                  {selectedOption !== null && isPicked && !isAnswer && (
                    <span className="text-xs font-mono whitespace-nowrap shrink-0">
                      ✕ 選項錯誤
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="p-4 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1C1917]">
                  {selectedOption === currentCloze.answer
                    ? '回答正確！這句名言極適合用於議論文引例結尾。'
                    : `正確答案為：「${currentCloze.answer}」`}
                </p>
                {matchedClozeFigure && (
                  <p className="text-xs text-[#44403C]">
                    核心論點：{stripLeadingBullet(matchedClozeFigure.coreArguments[0] || '')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {matchedClozeFigure && (
                  <button
                    type="button"
                    onClick={() => onOpenFigure(matchedClozeFigure)}
                    className="px-3 py-2 text-xs font-medium bg-white text-[#1C1917] border border-[#D6CEBE] rounded-lg hover:bg-[#EBE6DF] transition-colors whitespace-nowrap shrink-0"
                  >
                    查看完整人物卡
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextCloze}
                  className="px-4 py-2 text-xs font-medium bg-[#1C1917] text-white rounded-lg hover:bg-[#292524] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>下一題</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Dialectical Flashcards */}
      {subMode === 'flashcards' && (
        <div className="bg-white border border-[#D6CEBE] rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
            <div className="flex items-center gap-3">
              <label htmlFor="deck-theme-select" className="text-xs font-medium text-[#57534E]">
                篩選抽卡範圍：
              </label>
              <select
                id="deck-theme-select"
                value={flashcardThemeFilter}
                onChange={(e) => {
                  setFlashcardThemeFilter(e.target.value);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg text-[#1C1917]"
              >
                <option value="all">全部六大主題（共 {figures.length} 張）</option>
                <option value="theme-1">主題一：學習與成長</option>
                <option value="theme-2">主題二：人生選擇與突破</option>
                <option value="theme-3">主題三：傳統、模仿與創新</option>
                <option value="theme-4">主題四：誠信、責任與公共價值</option>
                <option value="theme-5">主題五：人際關係與溝通</option>
                <option value="theme-6">主題六：逆境、情緒與品格</option>
              </select>
            </div>

            <div className="text-xs font-mono text-[#57534E] tabular-nums">
              卡片 {safeCardIndex + 1} / {filteredDeck.length} · 全庫已掌握 {masteredIds.length} 人
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-xl p-6 md:p-8 min-h-[340px] flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
              <span className="text-xs font-mono text-[#78350F] tabular-nums">
                {isFlipped ? '【背面：總論點、正反論證與一例多用】' : '【正面：人物簡介與核心事跡】'}
              </span>
              <span className="text-xs text-[#57534E]">
                主題 {currentCard.themeNumber} · {currentCard.eraOrRegion}
              </span>
            </div>

            {!isFlipped ? (
              <div className="py-6 space-y-4">
                <h3 className="text-3xl font-bold text-[#1C1917]">{currentCard.name}</h3>
                <p className="text-base text-[#44403C]">{currentCard.bio}</p>
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-[#9A3412]">
                    請回憶此人物可論證之總論點、正面分論點與反面思考：
                  </p>
                  <ul className="space-y-1.5 text-sm text-[#292524]">
                    {currentCard.deeds.map((d, i) => (
                      <li key={i}>
                        <span className="font-mono text-xs text-[#78350F] mr-2 tabular-nums">
                          0{i + 1}.
                        </span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-bold text-[#1C1917]">{currentCard.name}</h3>
                  <span className="text-xs font-medium text-[#9A3412]">
                    一例多用：{currentCard.multiUse}
                  </span>
                </div>

                <div className="p-3.5 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg">
                  <p className="text-sm font-editorial font-semibold text-[#1C1917]">
                    {currentCard.quotes.join(' ／ ')}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3.5 bg-white border border-[#E7E2D8] rounded-lg">
                    <span className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      核心總論點
                    </span>
                    <ul className="space-y-1 text-xs text-[#292524] leading-relaxed">
                      {currentCard.coreArguments.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E7E2D8] rounded-lg">
                    <span className="block text-xs font-bold text-[#14532D] mb-1.5">
                      正面論證
                    </span>
                    <ul className="space-y-1 text-xs text-[#292524] leading-relaxed">
                      {currentCard.positiveArguments.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-white border border-[#E7E2D8] rounded-lg">
                    <span className="block text-xs font-bold text-[#9A3412] mb-1.5">
                      駁論／反面思考
                    </span>
                    <ul className="space-y-1 text-xs text-[#292524] leading-relaxed">
                      {currentCard.counterArguments.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E7E2D8]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((i) => (i - 1 + filteredDeck.length) % filteredDeck.length);
                  }}
                  className="px-3 py-2 text-xs font-medium bg-white text-[#1C1917] border border-[#D6CEBE] rounded-lg hover:bg-[#EBE6DF] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>上一張</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFlipped(false);
                    setCardIndex((i) => (i + 1) % filteredDeck.length);
                  }}
                  className="px-3 py-2 text-xs font-medium bg-white text-[#1C1917] border border-[#D6CEBE] rounded-lg hover:bg-[#EBE6DF] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>下一張</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleMastered(currentCard.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    isCurrentCardMastered
                      ? 'bg-[#14532D] text-white border-[#14532D]'
                      : 'bg-white text-[#1C1917] border-[#D6CEBE] hover:bg-[#EBE6DF]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isCurrentCardMastered ? '已標記掌握' : '標記為已掌握'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped((f) => !f)}
                  className="px-4 py-2 text-xs font-medium bg-[#9A3412] text-white rounded-lg hover:bg-[#7C2D12] transition-colors whitespace-nowrap shrink-0"
                >
                  {isFlipped ? '翻回正面（事跡）' : '翻開背面（檢視論點答案）'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Scenario / Thesis Matcher */}
      {subMode === 'matcher' && currentMatcher && (
        <div className="bg-white border border-[#D6CEBE] rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E7E2D8]">
            <span className="text-xs font-mono text-[#57534E] tabular-nums">
              審題配對第 {(matcherIndex % matcherQuestions.length) + 1} / {matcherQuestions.length} 題 · 累計得分 {matcherScore}
            </span>
            <span className="text-xs text-[#78350F]">
              根據「核心論點」與「駁論反思」選出最契合的人物例子
            </span>
          </div>

          <div className="p-5 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg space-y-3">
            <p className="text-base md:text-lg font-bold text-[#1C1917]">
              【核心論點】「{currentMatcher.thesisPrompt}」
            </p>
            <p className="text-sm text-[#44403C]">
              【反面思考／限制】「{currentMatcher.counterPrompt}」
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentMatcher.options.map((opt) => {
              const isPicked = matcherPickId === opt.id;
              const isCorrect = opt.id === currentMatcher.targetFig.id;

              let cardClass =
                'bg-[#FBF9F5] text-[#1C1917] border-[#D6CEBE] hover:bg-[#EBE6DF]';
              if (matcherPickId !== null) {
                if (isCorrect) {
                  cardClass = 'bg-[#14532D] text-white border-[#14532D]';
                } else if (isPicked && !isCorrect) {
                  cardClass = 'bg-[#991B1B] text-white border-[#991B1B]';
                } else {
                  cardClass = 'bg-[#FBF9F5] text-[#78716C] border-[#E7E2D8] opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectMatcher(opt.id)}
                  className={`p-4 text-left rounded-lg border transition-colors flex flex-col justify-between gap-1 ${cardClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-bold">{opt.name}</span>
                    <span className="text-xs opacity-80">{opt.eraOrRegion}</span>
                  </div>
                  <p className="text-xs opacity-90 line-clamp-1">{opt.bio}</p>
                </button>
              );
            })}
          </div>

          {matcherPickId !== null && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F3EFE6] border border-[#D6CEBE] rounded-lg">
              <div className="text-sm font-medium text-[#1C1917]">
                {matcherPickId === currentMatcher.targetFig.id
                  ? `配對正確！${currentMatcher.targetFig.name}正是此論點的最佳代表。`
                  : `正確人物為：${currentMatcher.targetFig.name}（${currentMatcher.targetFig.eraOrRegion}）`}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenFigure(currentMatcher.targetFig)}
                  className="px-3 py-2 text-xs font-medium bg-white text-[#1C1917] border border-[#D6CEBE] rounded-lg hover:bg-[#EBE6DF] whitespace-nowrap shrink-0"
                >
                  檢視人物詳情
                </button>
                <button
                  type="button"
                  onClick={handleNextMatcher}
                  className="px-4 py-2 text-xs font-medium bg-[#1C1917] text-white rounded-lg hover:bg-[#292524] flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>下一題配對</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
