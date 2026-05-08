import { beforeEach, describe, expect, test, vi } from "vitest";
const requireAuthenticatedUser = vi.fn();
vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser,
  withHandler: (handler: () => Promise<Response>) => handler(),
}));

describe('/api/v1/home/insight-banners', () => {
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks(); vi.unstubAllGlobals();
  });
  test('GET: Spring state를 호출하고 dismissals 응답을 유지한다', async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: 'user-1' }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = 'internal-token';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ dismissals: [{ bannerKey: 'counseling_none', hiddenUntil: null }, { bannerKey: 'counseling_warning', hiddenUntil: null }] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const { GET } = await import('../route');
    const response = await GET(new Request('http://localhost/api/v1/home/insight-banners', { method: 'GET' }) as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.dismissals).toHaveLength(2);
  });
  test('POST: Spring dismiss를 호출하고 dismissal 응답을 유지한다', async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: 'user-1' }, response: null });
    process.env.SPRING_INTERNAL_TOKEN = 'internal-token';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ dismissal: { bannerKey: 'counseling_none', hiddenUntil: '2026-05-08T06:00:00Z' } }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const { POST } = await import('../route');
    const response = await POST(new Request('http://localhost/api/v1/home/insight-banners', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bannerKey: 'counseling_none' }) }) as never);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.dismissal.bannerKey).toBe('counseling_none');
  });
});
