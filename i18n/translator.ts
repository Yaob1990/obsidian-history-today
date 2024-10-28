import { LOCALES, LocaleKey, TranslationKey } from './locales';

export class Translator {
  private locale: LocaleKey = 'en';

  constructor() {
    // 获取系统语言
    const systemLocale = window.navigator.language;
    this.setLocale(systemLocale as LocaleKey);
  }

  setLocale(locale: string) {
    if (locale.startsWith('zh')) {
      this.locale = 'zh-CN';
    } else {
      this.locale = 'en';
    }
  }

  t(key: TranslationKey): string {
    return LOCALES[this.locale][key] || LOCALES['en'][key];
  }
}
