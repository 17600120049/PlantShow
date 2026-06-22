/**
 * Lucide 图标路径映射 — 使用 PNG（微信小程序兼容）
 */

const COLOR_VARIANT = {
  '#2D4739': 'primary',
  '#3F5F4E': 'primary',
  '#FFFFFF': 'white',
  '#9C9690': 'gray',
  '#CCCCCC': 'lightgray',
  '#C4785A': 'accent',
  '#D4A017': 'gold',
  '#B8860B': 'gold-dark',
  '#6B8B7A': 'sage',
  'rgba(255,255,255,0.75)': 'white-dim',
  'rgba(255,255,255,0.78)': 'white-dim'
};

function resolveIconSrc(name, color, strokeWidth, filled) {
  if (name === 'heart') {
    return filled ? '/static/icons/tab/heart-active.png' : '/static/icons/tab/heart.png';
  }

  if (filled) {
    if (name === 'star' && color === '#D4A017') return '/static/icons/star/gold-fill.png';
  }

  if (name === 'leaf' && color === '#2D4739') {
    return strokeWidth >= 2
      ? '/static/icons/leaf/primary-bold.png'
      : '/static/icons/leaf/primary.png';
  }

  if (name === 'sprout' && color === '#FFFFFF' && strokeWidth >= 2.2) {
    return '/static/icons/sprout/white.png';
  }

  const variant = COLOR_VARIANT[color] || 'primary';
  return `/static/icons/${name}/${variant}.png`;
}

module.exports = { resolveIconSrc };
