// 前后端共用的分类与难度定义。改分类只需要改这里。
export const CATEGORIES = [
  { name: '凉菜', emoji: '🥒' },
  { name: '荤菜', emoji: '🍖' },
  { name: '素菜', emoji: '🥬' },
  { name: '汤羹', emoji: '🍲' },
  { name: '主食', emoji: '🍚' },
  { name: '甜点小吃', emoji: '🍮' },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const DIFFICULTIES = ['简单', '中等', '较难'];

export function categoryEmoji(name) {
  return CATEGORIES.find((c) => c.name === name)?.emoji ?? '🍽️';
}
