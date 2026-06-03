import {
  type CardDeckAssetUploadResponse,
  cardDeckAssetUploadResponseSchema,
} from "@yeon/api-contract/card-decks";
import { getMobileApiBaseUrl } from "../api-base-url";

// 카드 이미지 업로드(POST /api/v1/card-decks/assets, multipart). 라우트가 인증을 요구하지
// 않으므로 게스트/로그인 무관하게 업로드 가능. 응답의 imageUrl을 마크다운에 삽입한다.
export async function uploadCardImageAsset(asset: {
  uri: string;
  name: string;
  mimeType: string;
}): Promise<CardDeckAssetUploadResponse> {
  const formData = new FormData();
  // React Native multipart file 파트.
  formData.append("file", {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType,
  } as unknown as Blob);

  const response = await fetch(
    `${getMobileApiBaseUrl()}/api/v1/card-decks/assets`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = "이미지를 업로드하지 못했습니다.";
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      // 본문 파싱 실패는 기본 메시지.
    }
    throw new Error(message);
  }

  return cardDeckAssetUploadResponseSchema.parse(await response.json());
}
