import { http, HttpResponse } from 'msw';
import { mockAdminUser } from '../fixtures';

const API_BASE = 'http://localhost:3000';

export const authHandlers = [
  http.get(`${API_BASE}/auth/csrf-token`, () => {
    return HttpResponse.json({ csrfToken: 'test-csrf-token' });
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({ user: mockAdminUser });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials', errorCode: 'INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json({ user: mockAdminUser });
  }),
];
