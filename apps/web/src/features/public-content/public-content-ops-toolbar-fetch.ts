import type { PublicContentOpsToolbarModel } from "./public-content-ops-toolbar";

export async function fetchPublicContentOpsToolbarModel(requestHref: string) {
  const response = await fetch(requestHref, {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 204 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error("운영 확인 정보를 불러오지 못했습니다.");
  }

  return (await response.json()) as PublicContentOpsToolbarModel;
}
