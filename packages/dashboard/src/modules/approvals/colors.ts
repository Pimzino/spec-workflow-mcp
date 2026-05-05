export function hexToColorObject(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const bg = `rgba(${r}, ${g}, ${b}, 0.3)`;
  const border = hex;
  const name = hex.toLowerCase();
  return { bg, border, name };
}

export function isValidHex(hex: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}


