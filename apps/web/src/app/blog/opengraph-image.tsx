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
    title: "서비스를 만들며 확인한 구현 기록",
    description: "NEXA, 타자방, 플래시카드, 커뮤니티의 실제 구현 기록",
  });
}
