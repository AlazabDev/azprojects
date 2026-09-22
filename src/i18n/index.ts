import { translations, Language, Direction, Translations } from './translations';

export * from './translations';

export const DEFAULT_LANGUAGE: Language = 'ar';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem('azprojects_lang');
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to load language from localStorage', e);
  }
  return DEFAULT_LANGUAGE;
}

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('azprojects_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to load theme from localStorage', e);
  }
  return 'light'; // Light mode is strictly primary by default
}

export function getDirection(lang: Language): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function translate(key: keyof Translations, lang: Language): string {
  const dict = translations[lang] || translations[DEFAULT_LANGUAGE];
  return dict[key] || translations[DEFAULT_LANGUAGE][key] || (key as string);
}
