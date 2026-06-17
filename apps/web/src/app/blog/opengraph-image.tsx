import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createOgImage,
} from "../_lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "YEON BLOG",
    title: "제품을 만들며 남기는 기술과 결정의 기록",
    description:
      "YEON과 NEXA를 만들며 남기는 개발기, 기술 선택, 제품 운영 판단",
  });
}
