/**
 * Theme palettes. Light = default cream-and-blue dyslexia-friendly look.
 * Dark = soft navy with warmer text (still avoids harsh black/white).
 */
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;

  primary: string;
  primaryDark: string;
  primaryLight: string;

  secondary: string;
  accent: string;

  success: string;
  warning: string;
  error: string;
  info: string;

  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  textMuted: string;

  border: string;
  divider: string;

  childAvatarBg: readonly string[];
  cardBorder: string;
  inputBg: string;
  shadowColor: string;
}

export const lightColors: ThemeColors = {
  background: '#FFF8E7',
  surface: '#FDF6E3',
  card: '#FFFFFF',

  primary: '#5B8DEF',
  primaryDark: '#3A6BC4',
  primaryLight: '#A9C6F5',

  secondary: '#4CAF9E',
  accent: '#FFB74D',

  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',

  textPrimary: '#3D3D3D',
  textSecondary: '#707070',
  textOnPrimary: '#FFFFFF',
  textMuted: '#A0A0A0',

  border: '#E6DCC2',
  divider: '#EEE4CC',

  childAvatarBg: ['#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'],
  cardBorder: '#E6DCC2',
  inputBg: '#FFFFFF',
  shadowColor: '#1F3B73',
};

export const darkColors: ThemeColors = {
  background: '#1B2031',
  surface: '#242A3D',
  card: '#2D344A',

  primary: '#7AA9FF',
  primaryDark: '#5B8DEF',
  primaryLight: '#3A6BC4',

  secondary: '#5DC9B5',
  accent: '#FFC979',

  success: '#9BD8A0',
  warning: '#FFC979',
  error: '#F08A8A',
  info: '#7DC1F0',

  textPrimary: '#F0E9D8',
  textSecondary: '#B6BFD4',
  textOnPrimary: '#1B2031',
  textMuted: '#7B8398',

  border: '#3A4258',
  divider: '#323A4F',

  childAvatarBg: ['#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'],
  cardBorder: '#3A4258',
  inputBg: '#2D344A',
  shadowColor: '#000000',
};

/**
 * Backwards-compatible default export — screens that haven't been refactored
 * to useTheme() will keep getting the light palette.
 */
export const Colors = lightColors;

export type AppColor = keyof ThemeColors;
