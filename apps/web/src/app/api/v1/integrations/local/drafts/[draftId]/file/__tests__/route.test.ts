import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRequireAuthenticatedUser = vi.fn();
const mockFetchImportDraftFileFromSpring = vi.fn();

vi.mock("@/app/api/v1/counseling-records/_shared", () => ({
  jsonError: (message: string, status: number) => Response.json({ message }, { status }),
  requireAuthenticatedUser: (...args: unknown[]) => mockRequireAuthenticatedUser(...args),
}));
vi.mock("@/server/import-drafts-spring-client", async () => {
  const actual = await vi.importActual<typeof import("@/server/import-drafts-spring-client")>("@/server/import-drafts-spring-client");
  return {
    ...actual,
    fetchImportDraftFileFromSpring: (...args: unknown[]) => mockFetchImportDraftFileFromSpring(...args),
  };
});

import { GET } from "../route";

describe("local draft file route", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET은 Spring base64 file을 다운로드 응답으로 바꾼다", async () => {
    mockRequireAuthenticatedUser.mockResolvedValue({ currentUser: { id: "user-1" }, response: null });
    mockFetchImportDraftFileFromSpring.mockResolvedValue({ fileName: 'students.csv', mimeType: 'text/csv', base64: Buffer.from('a,b').toString('base64') });
    const response = await GET(new NextRequest('http://localhost/api/v1/integrations/local/drafts/draft-1/file'), { params: Promise.resolve({ draftId: 'draft-1' }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
  });
});
