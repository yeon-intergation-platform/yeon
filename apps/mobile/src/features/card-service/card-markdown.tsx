import {
  YeonImage,
  createYeonStyleSheet,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import * as ExpoLinking from "expo-linking";
import { memo, useState } from "react";
import Markdown, { type RenderRules } from "react-native-markdown-display";
import { getMobileApiBaseUrl } from "../../services/api-base-url";

// data: URI 최대 허용 길이(5 MB base64 상당).
const DATA_URI_MAX_LENGTH = 7_000_000;

// 외부 이미지 src scheme 화이트리스트: http/https만 허용. data: URI는 길이 상한 내에서 허용.
// 상대 경로(/api/...)는 자체 API base로 절대화한다.
function resolveImageSrc(src: string): string | null {
  if (!src) return null;
  if (src.startsWith("/")) return `${getMobileApiBaseUrl()}${src}`;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("data:")) {
    return src.length <= DATA_URI_MAX_LENGTH ? src : null;
  }
  // 그 외 스킴(javascript:, file:, custom: 등)은 렌더하지 않는다.
  return null;
}

// 링크 스킴 화이트리스트: http/https만 외부 브라우저로 열고 나머지는 차단한다.
function handleLinkPress(url: string): boolean {
  if (/^https?:\/\//i.test(url)) {
    void ExpoLinking.openURL(url);
  }
  // true를 반환해 라이브러리 기본 동작(인앱 처리)을 막는다.
  return true;
}

// idx=133: 종횡비 인지 이미지 컴포넌트. onLoad로 실제 크기를 받아 aspectRatio를 계산한다.
// maxHeight로 세로로 지나치게 긴 이미지를 안전하게 제한하고 contain으로 잘림을 방지한다.
function AdaptiveImage({ src, nodeKey }: { src: string; nodeKey: string }) {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

  return (
    <YeonImage
      key={nodeKey}
      resizeMode="contain"
      source={{ uri: src }}
      style={[
        styles.image,
        aspectRatio !== undefined ? { aspectRatio, height: undefined } : null,
      ]}
      onLoad={(e) => {
        const { width, height } = e.nativeEvent.source;
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      }}
    />
  );
}

const rules: RenderRules = {
  image: (node) => {
    const src = resolveImageSrc(String(node.attributes?.src ?? ""));
    if (!src) return null;
    return <AdaptiveImage key={node.key} src={src} nodeKey={node.key} />;
  },
};

const BOLD = "800" as const;
const SEMIBOLD = "700" as const;
const ITALIC = "italic" as const;
const UNDERLINE = "underline" as const;

// 톤별 색(반전 톤은 다크 배경 박스용 — 흰 텍스트).
function buildMarkdownStyles(palette: {
  text: string;
  surface: string;
  border: string;
}) {
  return {
    body: { color: palette.text, fontSize: 16, lineHeight: 24 },
    heading1: { fontSize: 22, fontWeight: BOLD, marginBottom: 6, marginTop: 4 },
    heading2: { fontSize: 19, fontWeight: BOLD, marginBottom: 6, marginTop: 4 },
    heading3: {
      fontSize: 17,
      fontWeight: SEMIBOLD,
      marginBottom: 4,
      marginTop: 4,
    },
    strong: { fontWeight: BOLD },
    em: { fontStyle: ITALIC },
    bullet_list: { marginVertical: 4 },
    ordered_list: { marginVertical: 4 },
    list_item: { marginVertical: 2 },
    blockquote: {
      backgroundColor: palette.surface,
      borderLeftColor: palette.border,
      borderLeftWidth: 3,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    code_inline: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: 6,
      borderWidth: 1,
      color: palette.text,
      fontFamily: "Menlo",
      fontSize: 14,
      paddingHorizontal: 4,
    },
    fence: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: 10,
      borderWidth: 1,
      color: palette.text,
      fontFamily: "Menlo",
      fontSize: 14,
      padding: 12,
    },
    code_block: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      borderRadius: 10,
      borderWidth: 1,
      color: palette.text,
      fontFamily: "Menlo",
      fontSize: 14,
      padding: 12,
    },
    table: {
      borderColor: palette.border,
      borderRadius: 10,
      borderWidth: 1,
      marginVertical: 6,
    },
    thead: { backgroundColor: palette.surface },
    th: {
      borderColor: palette.border,
      borderWidth: 0.5,
      fontWeight: SEMIBOLD,
      padding: 8,
    },
    td: { borderColor: palette.border, borderWidth: 0.5, padding: 8 },
    hr: { backgroundColor: palette.border, height: 1, marginVertical: 10 },
    link: { color: palette.text, textDecorationLine: UNDERLINE },
  };
}

const styles = createYeonStyleSheet({
  // height: 기본값(onLoad 전 fallback). 실제 종횡비 로드 후 undefined로 교체.
  image: { height: 180, marginVertical: 6, maxHeight: 320, width: "100%" },
});

const defaultMarkdownStyles = createYeonStyleSheet(
  buildMarkdownStyles({
    text: yeonMobileAppColors.text,
    surface: yeonMobileAppColors.surface,
    border: yeonMobileAppColors.border,
  })
);

// 반전 톤(검정 배경 답변 박스용).
const invertedMarkdownStyles = createYeonStyleSheet(
  buildMarkdownStyles({
    text: "#FFFFFF",
    surface: "rgba(255,255,255,0.12)",
    border: "rgba(255,255,255,0.28)",
  })
);

type CardMarkdownProps = {
  source: string;
  tone?: "default" | "inverted";
};

// 카드 본문(질문/답변) 마크다운 렌더러 — 이미지·표·서식을 웹과 동일하게 표시.
// memo: 리스트에서 같은 source/tone이면 다른 카드의 메뉴 토글 시 리렌더되지 않게 한다.
export const CardMarkdown = memo(function CardMarkdown({
  source,
  tone = "default",
}: CardMarkdownProps) {
  return (
    <Markdown
      onLinkPress={handleLinkPress}
      rules={rules}
      style={
        tone === "inverted" ? invertedMarkdownStyles : defaultMarkdownStyles
      }
    >
      {source}
    </Markdown>
  );
});
