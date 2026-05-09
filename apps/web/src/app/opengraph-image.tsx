import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createOgImage,
} from "./_lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "YEON",
    title: "상담 기록, 타자연습, 플래시카드 학습",
    description:
      "여러 교육/학습 서비스를 한곳에서 열고 바로 이동할 수 있는 멀티 서비스 플랫폼",
  });
}
