import {
  YeonImage,
  createYeonStyleSheet,
  yeonMobileAppColors,
} from "@yeon/ui/native";
import Markdown, { type RenderRules } from "react-native-markdown-display";
import { getMobileApiBaseUrl } from "../../services/api-base-url";

// 상대 경로(/api/...) 이미지는 모바일 API base로 절대화한다(웹은 상대 경로 저장).
function resolveImageSrc(src: string) {
  if (!src) return src;
  if (/^https?:\/\//.test(src) || src.startsWith("data:")) return src;
  if (src.startsWith("/")) return `${getMobileApiBaseUrl()}${src}`;
  return src;
}

const rules: RenderRules = {
  image: (node) => {
    const src = resolveImageSrc(String(node.attributes?.src ?? ""));
    if (!src) return null;
    return (
      <YeonImage
        key={node.key}
        resizeMode="contain"
        source={{ uri: src }}
        style={styles.image}
      />
    );
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
  image: { height: 180, marginVertical: 6, width: "100%" },
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
export function CardMarkdown({ source, tone = "default" }: CardMarkdownProps) {
  return (
    <Markdown
      rules={rules}
      style={
        tone === "inverted" ? invertedMarkdownStyles : defaultMarkdownStyles
      }
    >
      {source}
    </Markdown>
  );
}
