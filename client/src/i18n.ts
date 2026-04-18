import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './locales/ar.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  // اكتشاف لغة الجهاز تلقائياً كخيار افتراضي
  lng: Localization.getLocales()[0].languageCode ?? 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// لدعم الاتجاه من اليمين لليسار في العربية
export const isRTL = i18n.language === 'ar';
I18nManager.allowRTL(isRTL);
I18nManager.forceRTL(isRTL);

export default i18n;