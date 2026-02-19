import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import common from './locales/th/common.json';
import validation from './locales/th/validation.json';
import errors from './locales/th/errors.json';
import auth from './locales/th/auth.json';
import users from './locales/th/users.json';
import departments from './locales/th/departments.json';
import sections from './locales/th/sections.json';
import navigation from './locales/th/navigation.json';
import database from './locales/th/database.json';
import backup from './locales/th/backup.json';
import systemLogs from './locales/th/systemLogs.json';
import profile from './locales/th/profile.json';
import systemSettings from './locales/th/systemSettings.json';

const resources = {
  th: {
    common,
    validation,
    errors,
    auth,
    users,
    departments,
    sections,
    navigation,
    database,
    backup,
    systemLogs,
    profile,
    systemSettings,
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
