import { beforeEach, describe, expect, test, vi } from "vitest";
const requireAuthenticatedUser = vi.fn();
const fetchPublicCheckLocationsFromSpring = vi.fn();
vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser,
  withHandler: (handler: () => Promise<Response>) => handler(),
}));
vi.mock("@/server/public-check-locations-spring-client", () => ({ fetchPublicCheckLocationsFromSpring }));

describe("/api/v1/spaces/[spaceId]/public-check-locations", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  test("GET: ownership-check 후 location search 응답을 유지한다", async () => {
    requireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    fetchPublicCheckLocationsFromSpring.mockResolvedValue({ results: [{ id: "place1", label: "강남", placeName: null, roadAddressName: null, addressName: null, latitude: 37.5, longitude: 127.0, source: "keyword" }] });
    const { GET } = await import("../route");
    const request = new Request("http://localhost/api/v1/spaces/space-1/public-check-locations?query=강남", { method: "GET" }) as Request & { nextUrl?: URL };
    request.nextUrl = new URL(request.url);
    const response = await GET(request as never, { params: Promise.resolve({ spaceId: "space-1" }) });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.results[0].id).toBe("place1");
    expect(fetchPublicCheckLocationsFromSpring).toHaveBeenCalledWith({ userId: "user-1", spaceId: "space-1", query: "강남" });
  });
});
