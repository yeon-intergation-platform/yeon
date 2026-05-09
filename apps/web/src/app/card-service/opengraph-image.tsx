import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  createOgImage,
} from "../_lib/og-image";

export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: "YEON FLASHCARD",
    title: "덱을 만들고 바로 복습하는 카드 학습",
    description:
      "덱과 카드를 만들고 바로 복습을 시작할 수 있으며, 현재 기기에서 시작한 학습도 계정으로 이어서 사용할 수 있습니다.",
  });
}
