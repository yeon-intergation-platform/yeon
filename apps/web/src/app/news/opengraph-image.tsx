import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createOgImage,
} from "../_lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "YEON NEWS",
    title: "공식 소식과 제품 업데이트",
    description:
      "YEON과 NEXA의 공지, 제품 변경사항, 업계 뉴스 해설을 구분해 기록하는 공식 소식",
  });
}
