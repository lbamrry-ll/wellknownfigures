import { DseTopicGuide, FigureEntry, ThemeId } from '../data/types';

export interface FilterCriteria {
  themeId: ThemeId | 'all';
  dseYear: string | 'all';
  eraFilter: 'all' | 'ancient-cn' | 'modern-cn-hk' | 'world';
  searchQuery: string;
  onlyBookmarked?: boolean;
  bookmarkedIds?: string[];
}

export function classifyEraCategory(eraOrRegion: string): 'ancient-cn' | 'modern-cn-hk' | 'world' {
  const worldKeywords = ['古希臘', '古羅馬', '波蘭', '法國', '巴基斯坦', '英國', '美國', '意大利', '荷蘭', '南非', '澳洲', '中外'];
  if (worldKeywords.some((k) => eraOrRegion.includes(k))) {
    return 'world';
  }
  const modernKeywords = ['現代', '香港', '台灣', '清初‧香港'];
  if (modernKeywords.some((k) => eraOrRegion.includes(k))) {
    return 'modern-cn-hk';
  }
  return 'ancient-cn';
}

export function filterFigures(figures: FigureEntry[], criteria: FilterCriteria): FigureEntry[] {
  const q = criteria.searchQuery.trim().toLowerCase();

  return figures.filter((fig) => {
    if (criteria.themeId !== 'all' && fig.themeId !== criteria.themeId) {
      return false;
    }
    if (criteria.dseYear !== 'all' && !fig.dseYears.includes(criteria.dseYear)) {
      return false;
    }
    if (criteria.eraFilter !== 'all' && classifyEraCategory(fig.eraOrRegion) !== criteria.eraFilter) {
      return false;
    }
    if (criteria.onlyBookmarked && criteria.bookmarkedIds && !criteria.bookmarkedIds.includes(fig.id)) {
      return false;
    }
    if (!q) {
      return true;
    }

    const haystack = [
      fig.name,
      fig.eraOrRegion,
      fig.bio,
      ...fig.deeds,
      ...fig.quotes,
      ...fig.coreArguments,
      ...fig.positiveArguments,
      ...fig.counterArguments,
      fig.multiUse,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function stripLeadingBullet(text: string): string {
  return text.replace(/^[一二三四五六七八九十]+、\s*/, '').trim();
}

export function buildEssayParagraph(
  figure: FigureEntry,
  mode: 'positive' | 'dialectical' = 'dialectical'
): string {
  const thesis = stripLeadingBullet(figure.coreArguments[0] || '');
  const deed = figure.deeds[0] || '';
  const deedSecond = figure.deeds[1] ? `${figure.deeds[1]}` : '';
  const quote = figure.quotes[0] || '';
  const posArg = stripLeadingBullet(figure.positiveArguments[0] || '');
  const counterArg = stripLeadingBullet(figure.counterArguments[0] || '');

  const baseParagraph = `【分論點】${thesis}。\n【事例論證】試觀${figure.eraOrRegion}之${figure.name}（${figure.bio.replace(/。$/, '')}）：${deed}${deedSecond}其言有云：${quote}。由此可見，${posArg}。`;

  if (mode === 'positive') {
    return baseParagraph;
  }

  return `${baseParagraph}\n【駁論與思辨昇華】然而，吾人引例論證時亦須慎思：${counterArg}。唯有兼顧正反兩面，方能使立論周延而不流於偏頗。`;
}

export function buildFullEssayOutline(
  topic: DseTopicGuide,
  positiveFigures: FigureEntry[],
  counterFigures: FigureEntry[],
  customStance?: string
): string {
  const stanceLine = customStance?.trim()
    ? customStance.trim()
    : topic.coreTension;

  const posBlocks = positiveFigures
    .map((f, idx) => {
      const core = stripLeadingBullet(f.coreArguments[0] || '');
      const pos = stripLeadingBullet(f.positiveArguments[0] || '');
      const deed = f.deeds[0] || '';
      const quote = f.quotes[0] || '';
      return `  ${idx + 1}. 【${f.name}（${f.eraOrRegion}）】\n     · 論點切入：${core}\n     · 核心事跡：${deed}\n     · 經典名言：${quote}\n     · 論證推演：${pos}`;
    })
    .join('\n\n');

  const counterBlocks = counterFigures
    .map((f, idx) => {
      const counter = stripLeadingBullet(f.counterArguments[0] || '');
      const deed = f.deeds[0] || '';
      return `  ${idx + 1}. 【${f.name}（${f.eraOrRegion}）】\n     · 反面／限制思考：${counter}\n     · 史實依據：${deed}`;
    })
    .join('\n\n');

  return [
    `《${topic.year} DSE 議論文實戰提綱：${topic.title}》`,
    `================================================`,
    `一、【中心立論與審題焦點】`,
    `   ${stanceLine}`,
    ``,
    `二、【正面論證段落（古今中外例子配搭）】`,
    posBlocks || '  （請至少選擇一位正面論證人物）',
    ``,
    `三、【駁論與思辨昇華（防範絕對化弊病）】`,
    counterBlocks || '  （請至少選擇一位反面／思辨人物）',
    ``,
    `四、【老師評卷提點】`,
    `   ${topic.teacherAdvice}`,
  ].join('\n');
}

export interface MasteryStats {
  totalFigures: number;
  masteredCount: number;
  bookmarkedCount: number;
  masteryPercentage: number;
}

export function calculateMasteryStats(
  totalFigures: number,
  masteredIds: string[],
  bookmarkedIds: string[]
): MasteryStats {
  const safeTotal = Math.max(1, totalFigures);
  const uniqueMastered = new Set(masteredIds).size;
  const uniqueBookmarked = new Set(bookmarkedIds).size;
  const masteryPercentage = Math.min(100, Math.round((uniqueMastered / safeTotal) * 100));

  return {
    totalFigures,
    masteredCount: uniqueMastered,
    bookmarkedCount: uniqueBookmarked,
    masteryPercentage,
  };
}
