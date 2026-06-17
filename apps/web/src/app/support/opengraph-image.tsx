import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createOgImage,
} from "../_lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "YEON SUPPORT",
    title: "서비스별 문제 해결과 사용 가이드",
    description:
      "NEXA, 타자연습, 플래시카드, 커뮤니티를 바로 사용할 수 있게 돕는 공개 도움말",
  });
}
