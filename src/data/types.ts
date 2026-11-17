export type ThemeId = 'theme-1' | 'theme-2' | 'theme-3' | 'theme-4' | 'theme-5' | 'theme-6';

export interface ThemeMeta {
  id: ThemeId;
  number: number;
  title: string;
  subtitle: string;
  pastPaperYears: string[];
  coreQuestion: string;
}

export interface FigureEntry {
  id: string;
  themeId: ThemeId;
  themeNumber: number;
  orderInTheme: number;
  name: string;
  eraOrRegion: string;
  bio: string;
  deeds: string[];
  quoteLabel: string; // 名言 / 精神概括 / 評語 / 理念 / 自述 / 主張 / 核心價值觀 / 校誓 / 創作立場 / 常言
  quotes: string[];
  coreArguments: string[]; // 總論點 / 核心論點
  positiveArguments: string[]; // 正面論證（分論點）
  counterArguments: string[]; // 駁論／反面思考
  multiUse: string; // 一例多用原文
  dseYears: string[]; // Extracted DSE year tags e.g., ["2026", "2018"]
  crossThemeRef?: string; // 如「見主題一」
}

export interface DseTopicGuide {
  year: string;
  title: string;
  coreTension: string;
  themeId: ThemeId;
  recommendedPositiveIds: string[];
  recommendedCounterIds: string[];
  teacherAdvice: string;
}

export interface ClozeQuestion {
  id: string;
  figureId: string;
  figureName: string;
  eraOrRegion: string;
  themeTitle: string;
  promptBefore: string;
  answer: string;
  promptAfter: string;
  options: string[];
  contextHint: string;
}
