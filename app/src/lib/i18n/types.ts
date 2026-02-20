import 'react-i18next';
import common from './locales/th/common.json';
import validation from './locales/th/validation.json';
import errors from './locales/th/errors.json';
import auth from './locales/th/auth.json';
import users from './locales/th/users.json';
import navigation from './locales/th/navigation.json';
import database from './locales/th/database.json';
import api from './locales/th/api.json';
import backup from './locales/th/backup.json';
import departments from './locales/th/departments.json';
import sections from './locales/th/sections.json';
import systemLogs from './locales/th/systemLogs.json';
import systemSettings from './locales/th/systemSettings.json';
import profile from './locales/th/profile.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      validation: typeof validation;
      errors: typeof errors;
      auth: typeof auth;
      users: typeof users;
      navigation: typeof navigation;
      database: typeof database;
      api: typeof api;
      backup: typeof backup;
      departments: typeof departments;
      sections: typeof sections;
      systemLogs: typeof systemLogs;
      systemSettings: typeof systemSettings;
      profile: typeof profile;
    };
  }
}

