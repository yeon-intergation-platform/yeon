const CARD_EDITOR_CODE_LANGUAGE_CLASS_PATTERN =
  /(?:^|\s)language-([a-z0-9_+#.-]+)/i;
const CARD_EDITOR_MARKDOWN_FENCE_PATTERN =
  /^\s*(```|~~~)([a-z0-9_+#.-]+)?[^\n]*\n([\s\S]*?)\n\1\s*$/i;

interface CardEditorRichContentCodeBlockPort {
  setLanguageClass(language: string | undefined): void;
}

interface CardEditorRichContentDocumentPort {
  getCodeBlocks(): CardEditorRichContentCodeBlockPort[];
  serializeBody(): string;
}

export interface CardEditorRichContentParserPort {
  parseHtml(value: string): CardEditorRichContentDocumentPort | undefined;
}

function createBrowserCardEditorRichContentParserPort(): CardEditorRichContentParserPort {
  return {
    parseHtml(value) {
      const DomParserConstructor = globalThis.DOMParser;

      if (!DomParserConstructor) {
        return undefined;
      }

      const parsedDocument = new DomParserConstructor().parseFromString(
        value,
        "text/html"
      );

      return {
        getCodeBlocks() {
          return Array.from(parsedDocument.querySelectorAll("pre code")).map(
            (codeBlock) => ({
              setLanguageClass(language) {
                if (language) {
                  codeBlock.setAttribute("class", `language-${language}`);
                  return;
                }

                codeBlock.removeAttribute("class");
              },
            })
          );
        },
        serializeBody() {
          return parsedDocument.body.innerHTML;
        },
      };
    },
  };
}

const CARD_EDITOR_RICH_CONTENT_PARSER_PORT =
  createBrowserCardEditorRichContentParserPort();

export interface CardEditorCodeBlockInfo {
  code: string;
  language?: string;
}

export const CARD_EDITOR_CODE_LANGUAGE_GROUPS = [
  {
    label: "자주 사용",
    options: [
      ["code", "일반 코드"],
      ["javascript", "JavaScript"],
      ["typescript", "TypeScript"],
      ["html", "HTML"],
      ["css", "CSS"],
      ["python", "Python"],
      ["java", "Java"],
      ["mermaid", "Mermaid"],
    ],
  },
  {
    label: "서버/앱",
    options: [
      ["c", "C"],
      ["cpp", "C++"],
      ["csharp", "C#"],
      ["go", "Go"],
      ["kotlin", "Kotlin"],
      ["swift", "Swift"],
      ["rust", "Rust"],
      ["php", "PHP"],
      ["ruby", "Ruby"],
    ],
  },
  {
    label: "데이터/문서",
    options: [
      ["json", "JSON"],
      ["yaml", "YAML"],
      ["sql", "SQL"],
      ["bash", "Bash"],
      ["markdown", "Markdown"],
      ["xml", "XML"],
    ],
  },
] as const;

const CARD_EDITOR_CODE_LANGUAGE_ALIASES: Record<string, string> = {
  "": "code",
  text: "code",
  plain: "code",
  plaintext: "code",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  cxx: "cpp",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
};

export function normalizeCardEditorCodeLanguage(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value
    .trim()
    .replace(/^language-/i, "")
    .toLowerCase();
  const aliased = CARD_EDITOR_CODE_LANGUAGE_ALIASES[normalized] ?? normalized;
  if (aliased === "code") return undefined;
  if (!/^[a-z0-9_+#.-]{1,32}$/.test(aliased)) return undefined;
  return aliased;
}

export function getCardEditorCodeLanguageSelectValue(value: unknown) {
  return normalizeCardEditorCodeLanguage(value) ?? "code";
}

export function getCardEditorCodeLanguageFromClassName(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = value.match(CARD_EDITOR_CODE_LANGUAGE_CLASS_PATTERN);
  return normalizeCardEditorCodeLanguage(match?.[1]);
}

export function parseSingleCardEditorMarkdownCodeFence(
  value: string
): CardEditorCodeBlockInfo | undefined {
  const match = value.match(CARD_EDITOR_MARKDOWN_FENCE_PATTERN);
  if (!match) return undefined;

  const language = normalizeCardEditorCodeLanguage(match[2]);
  const code = match[3]?.replace(/\r\n?/g, "\n") ?? "";

  return {
    code,
    language,
  };
}

function replaceMarkdownFenceLanguage(
  value: string,
  targetIndex: number,
  language: string | undefined
) {
  let currentIndex = 0;
  return value.replace(
    /(^|\n)(```|~~~)([a-z0-9_+#.-]+)?([^\n]*)\n/gim,
    (
      match,
      lineStart: string,
      fence: string,
      _oldLanguage: string,
      rest: string
    ) => {
      if (currentIndex !== targetIndex) {
        currentIndex += 1;
        return match;
      }
      currentIndex += 1;
      return `${lineStart}${fence}${language ?? ""}${rest}\n`;
    }
  );
}

export function updateCardEditorCodeBlockLanguageInRichContent(
  value: string,
  targetIndex: number,
  nextLanguageValue: string,
  parserPort: CardEditorRichContentParserPort = CARD_EDITOR_RICH_CONTENT_PARSER_PORT
) {
  const language = normalizeCardEditorCodeLanguage(nextLanguageValue);
  const richContentDocument = parserPort.parseHtml(value);
  const target = richContentDocument?.getCodeBlocks()[targetIndex];

  if (target && richContentDocument) {
    target.setLanguageClass(language);
    return richContentDocument.serializeBody();
  }

  return replaceMarkdownFenceLanguage(value, targetIndex, language);
}
