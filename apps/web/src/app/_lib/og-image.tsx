import { YeonOgImageFrame } from "@yeon/ui";
// 서버 전용(next/og → @vercel/og)이라 공개 배럴이 아닌 subpath로 직접 가져온다.
// 배럴에 두면 클라이언트 컴포넌트가 @yeon/ui를 import할 때 child_process/fs가 번들로 끌려와 빌드가 깨진다.
import { createYeonOgImageResponse } from "@yeon/ui/runtime/YeonOgImageResponse";

type OgImageOptions = {
  eyebrow: string;
  title: string;
  description: string;
};

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export function createOgImage({ eyebrow, title, description }: OgImageOptions) {
  return createYeonOgImageResponse(
    <YeonOgImageFrame
      description={description}
      eyebrow={eyebrow}
      title={title}
    />,
    OG_IMAGE_SIZE
  );
}
