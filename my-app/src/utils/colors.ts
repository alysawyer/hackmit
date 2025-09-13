// src/utils/colors.ts

export const colors = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#e0e0e0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} as const;

export const gradients = {
  primary: ['#4CAF50', '#66BB6A'],
  secondary: ['#2196F3', '#42A5F5'],
  sunset: ['#FF7043', '#FF5722'],
  ocean: ['#00BCD4', '#0097A7'],
} as const;

export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function generateColorFromSeed(seed: string): string {
  // Generate a pleasant color from seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 30); // 60-90%
  const lightness = 45 + (Math.abs(hash) % 20); // 45-65%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}
