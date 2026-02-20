import { userHandlers } from './users.handlers';
import { authHandlers } from './auth.handlers';

export const handlers = [...authHandlers, ...userHandlers];
