import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/th/common.json';
import validation from './locales/th/validation.json';
import errors from './locales/th/errors.json';
import auth from './locales/th/auth.json';
import users from './locales/th/users.json';
import navigation from './locales/th/navigation.json';

const resources = {
  th: {
    common,
    validation,
    errors,
    auth,
    users,
    navigation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'th',
    fallbackLng: 'th',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
