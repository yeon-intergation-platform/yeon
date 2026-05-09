import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createOgImage,
} from "../_lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "YEON TYPING",
    title: "로그인 없이 시작하는 한글 타자 연습",
    description:
      "속도와 정확도를 확인하고 개인 연습 뒤 타자방과 레이스까지 바로 이어서 이용할 수 있습니다.",
  });
}
