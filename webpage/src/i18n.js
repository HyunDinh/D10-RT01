import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

const savedLang = localStorage.getItem('i18nextLng') || 'vi';

// Nếu user đổi ngôn ngữ, i18n sẽ tự động update localStorage (từ v21+), nhưng ta sẽ đảm bảo chắc chắn
// bằng cách lắng nghe sự kiện changeLanguage

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Đảm bảo mỗi lần đổi ngôn ngữ sẽ lưu vào localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;