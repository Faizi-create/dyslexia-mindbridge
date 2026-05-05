/**
 * Typography uses Lexend — a dyslexia-friendly Google Font.
 * Swap to OpenDyslexic by adding the .otf files to src/assets/fonts/
 * and changing the `fontFamily` values below.
 */
export const FontFamily = {
  regular: 'Lexend_400Regular',
  medium: 'Lexend_500Medium',
  semiBold: 'Lexend_600SemiBold',
  bold: 'Lexend_700Bold',
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 22,
  xl: 28,
  xxl: 36,
  display: 44,
} as const;

export const LineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
} as const;
