import {
  type CardDeckAssetUploadResponse,
  cardDeckAssetUploadResponseSchema,
} from "@yeon/api-contract/card-decks";
import { getMobileApiBaseUrl } from "../api-base-url";

// 허용 mimeType 패턴: image/* 계열만 서버로 전송한다.
const IMAGE_MIME_PATTERN = /^image\//i;

// 파일명에서 경로 구분자(/ \)와 null 바이트를 제거해 경로 조작을 방지한다.
function sanitizeFileName(name: string): string {
  return name.replace(/[/\\]/g, "_").replace(/\0/g, "");
}

// 카드 이미지 업로드(POST /api/v1/card-decks/assets, multipart). 라우트가 인증을 요구하지
// 않으므로 게스트/로그인 무관하게 업로드 가능. 응답의 imageUrl을 마크다운에 삽입한다.
export async function uploadCardImageAsset(asset: {
  uri: string;
  name: string;
  mimeType: string;
}): Promise<CardDeckAssetUploadResponse> {
  // idx=139: 클라이언트에서도 image/* 여부를 확인하고, 파일명을 정규화한다.
  if (!IMAGE_MIME_PATTERN.test(asset.mimeType)) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }
  const safeName = sanitizeFileName(asset.name) || "image.jpg";

  const formData = new FormData();
  // React Native multipart file 파트.
  formData.append("file", {
    uri: asset.uri,
    name: safeName,
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
