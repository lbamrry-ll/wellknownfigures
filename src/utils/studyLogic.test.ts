import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_FIGURES, DSE_TOPIC_GUIDES } from '../data/dseTopics';
import {
  buildEssayParagraph,
  buildFullEssayOutline,
  calculateMasteryStats,
  classifyEraCategory,
  filterFigures,
  stripLeadingBullet,
} from './studyLogic';

test('ALL_FIGURES contains all 78 entries across the 6 themes from the teacher PDF', () => {
  assert.equal(ALL_FIGURES.length, 78);
  const theme1 = filterFigures(ALL_FIGURES, {
    themeId: 'theme-1',
    dseYear: 'all',
    eraFilter: 'all',
    searchQuery: '',
  });
  assert.equal(theme1.length, 14);

  const theme5 = filterFigures(ALL_FIGURES, {
    themeId: 'theme-5',
    dseYear: 'all',
    eraFilter: 'all',
    searchQuery: '',
  });
  assert.equal(theme5.length, 15);
});

test('filterFigures searches by name, quote, and DSE year accurately', () => {
  const byQuote = filterFigures(ALL_FIGURES, {
    themeId: 'all',
    dseYear: 'all',
    eraFilter: 'all',
    searchQuery: '移步不換形',
  });
  assert.equal(byQuote.length, 1);
  assert.equal(byQuote[0].name, '梅蘭芳');

  const by2026 = filterFigures(ALL_FIGURES, {
    themeId: 'all',
    dseYear: '2026',
    eraFilter: 'all',
    searchQuery: '',
  });
  assert.ok(by2026.length >= 15);
});

test('classifyEraCategory distinguishes ancient Chinese, modern Chinese/HK, and world figures', () => {
  assert.equal(classifyEraCategory('春秋'), 'ancient-cn');
  assert.equal(classifyEraCategory('香港'), 'modern-cn-hk');
  assert.equal(classifyEraCategory('古希臘'), 'world');
});

test('stripLeadingBullet and buildEssayParagraph generate structured argumentative text', () => {
  assert.equal(stripLeadingBullet('一、學問是在師友往來問答中領悟出來的'), '學問是在師友往來問答中領悟出來的');
  const kongzi = ALL_FIGURES[0];
  const paragraph = buildEssayParagraph(kongzi, 'dialectical');
  assert.ok(paragraph.includes('【分論點】'));
  assert.ok(paragraph.includes('【事例論證】'));
  assert.ok(paragraph.includes('【駁論與思辨昇華】'));
});

test('buildFullEssayOutline and calculateMasteryStats compute expected outputs', () => {
  const topic2026 = DSE_TOPIC_GUIDES[0];
  const outline = buildFullEssayOutline(topic2026, [ALL_FIGURES[0]], [ALL_FIGURES[1]]);
  assert.ok(outline.includes('2026 DSE 議論文實戰提綱'));
  assert.ok(outline.includes('孔子'));
  assert.ok(outline.includes('蘇格拉底'));

  const stats = calculateMasteryStats(78, ['t1-1-kongzi', 't1-2-socrates'], ['t1-1-kongzi']);
  assert.equal(stats.masteredCount, 2);
  assert.equal(stats.bookmarkedCount, 1);
  assert.equal(stats.masteryPercentage, Math.round((2 / 78) * 100));
});
