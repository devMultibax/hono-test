import 'react-i18next';
import common from './locales/th/common.json';
import validation from './locales/th/validation.json';
import errors from './locales/th/errors.json';
import auth from './locales/th/auth.json';
import users from './locales/th/users.json';
import navigation from './locales/th/navigation.json';

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
    };
  }
}
