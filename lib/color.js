export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function channels(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// "#24A0B5" -> "36 160 181", the format Tailwind's <alpha-value> needs.
function hexToRgbChannels(hex) {
  return channels(hex).join(' ');
}

// WCAG relative luminance.
function relativeLuminance(hex) {
  const [r, g, b] = channels(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function readableForegroundChannels(hex) {
  return relativeLuminance(hex) > 0.4 ? '2 25 29' : '255 255 255';
}

export function accentStyle(hex) {
  if (!HEX_COLOR.test(hex ?? '')) return undefined;
  return {
    '--accent-rgb': hexToRgbChannels(hex),
    '--accent-fg-rgb': readableForegroundChannels(hex),
  };
}
