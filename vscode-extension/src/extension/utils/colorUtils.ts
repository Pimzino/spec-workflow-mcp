import { HighlightColor } from '../types.js';

/**
 * Convert hex color to RGBA with alpha transparency for background
 */
export function hexToColorObject(hex: string): HighlightColor {
  // Validate hex format
  if (!isValidHex(hex)) {
    // Fallback to default yellow
    hex = '#FFEB3B';
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.3)`, // 30% transparency for background
    border: hex, // Full opacity for border
    name: hex.toUpperCase()
  };
}

/**
 * Validate hex color format
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Get default highlight colors for quick selection
 */
export function getDefaultHighlightColors(): HighlightColor[] {
  const defaultColors = [
    '#FFEB3B', // Yellow
    '#FF5722', // Deep Orange
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#F44336', // Red
    '#00BCD4'  // Cyan
  ];

  return defaultColors.map(hex => hexToColorObject(hex));
}

/**
 * Generate a random highlight color
 */
export function generateRandomColor(): HighlightColor {
  const colors = [
    '#FFE082', '#FFAB40', '#FF8A65', '#F8BBD9', 
    '#CE93D8', '#B39DDB', '#9FA8DA', '#90CAF9',
    '#81D4FA', '#80DEEA', '#80CBC4', '#A5D6A7',
    '#C5E1A5', '#E6EE9C', '#FFF59D', '#FFCC02'
  ];
  
  const randomHex = colors[Math.floor(Math.random() * colors.length)];
  return hexToColorObject(randomHex);
}

/**
 * Ensure color has good contrast for readability
 */
export function ensureReadableColor(hex: string): HighlightColor {
  const color = hexToColorObject(hex);
  
  // Calculate luminance to determine if we need to adjust
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Formula for relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If color is too dark, increase background alpha for better visibility
  if (luminance < 0.3) {
    const newR = Math.min(255, r + 50);
    const newG = Math.min(255, g + 50);
    const newB = Math.min(255, b + 50);
    
    return {
      bg: `rgba(${newR}, ${newG}, ${newB}, 0.4)`,
      border: hex,
      name: hex.toUpperCase()
    };
  }
  
  return color;
}