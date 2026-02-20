import { http, HttpResponse } from 'msw';
import { mockUser } from '../fixtures';

const API_BASE = 'http://localhost:3000';

export const userHandlers = [
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json({
      data: [mockUser],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    const id = Number(params.id);
    if (id === mockUser.id) {
      return HttpResponse.json(mockUser);
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),

  http.post(`${API_BASE}/users`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(
      { id: 99, ...body, createdAt: new Date().toISOString() },
      { status: 201 }
    );
  }),

  http.put(`${API_BASE}/users/:id`, async ({ params, request }) => {
    const id = Number(params.id);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ ...mockUser, id, ...body });
  }),

  http.delete(`${API_BASE}/users/:id`, ({ params }) => {
    const id = Number(params.id);
    if (id === mockUser.id) {
      return new HttpResponse(null, { status: 204 });
    }
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  }),
];
