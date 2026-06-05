import type { ReactNode } from "react";
import { YeonText } from "@yeon/ui";

const KEYWORDS_BY_LANGUAGE: Record<string, readonly string[]> = {
  javascript: [
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "import",
    "let",
    "new",
    "return",
    "switch",
    "throw",
    "try",
    "typeof",
    "var",
    "while",
  ],
  typescript: [
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "default",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "from",
    "function",
    "if",
    "implements",
    "import",
    "interface",
    "let",
    "new",
    "private",
    "protected",
    "public",
    "readonly",
    "return",
    "switch",
    "throw",
    "try",
    "type",
    "typeof",
    "while",
  ],
  python: [
    "and",
    "as",
    "class",
    "def",
    "elif",
    "else",
    "except",
    "False",
    "finally",
    "for",
    "from",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "None",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "True",
    "try",
    "while",
    "with",
    "yield",
  ],
  java: [
    "abstract",
    "boolean",
    "break",
    "case",
    "catch",
    "class",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "for",
    "if",
    "implements",
    "import",
    "interface",
    "new",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "switch",
    "this",
    "throw",
    "try",
    "void",
    "while",
  ],
  c: [
    "break",
    "case",
    "const",
    "continue",
    "else",
    "enum",
    "for",
    "if",
    "return",
    "sizeof",
    "static",
    "struct",
    "switch",
    "typedef",
    "void",
    "while",
  ],
  cpp: [
    "auto",
    "break",
    "case",
    "class",
    "const",
    "continue",
    "else",
    "enum",
    "for",
    "if",
    "namespace",
    "new",
    "private",
    "protected",
    "public",
    "return",
    "sizeof",
    "static",
    "struct",
    "switch",
    "template",
    "typedef",
    "using",
    "void",
    "while",
  ],
  csharp: [
    "async",
    "await",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "else",
    "enum",
    "for",
    "if",
    "interface",
    "namespace",
    "new",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "switch",
    "throw",
    "try",
    "using",
    "var",
    "void",
    "while",
  ],
  go: [
    "break",
    "case",
    "chan",
    "const",
    "continue",
    "defer",
    "else",
    "fallthrough",
    "for",
    "func",
    "go",
    "if",
    "import",
    "interface",
    "map",
    "package",
    "range",
    "return",
    "select",
    "struct",
    "switch",
    "type",
    "var",
  ],
  kotlin: [
    "as",
    "break",
    "class",
    "continue",
    "data",
    "else",
    "false",
    "for",
    "fun",
    "if",
    "import",
    "in",
    "interface",
    "is",
    "null",
    "object",
    "package",
    "return",
    "true",
    "val",
    "var",
    "when",
    "while",
  ],
  swift: [
    "as",
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "defer",
    "else",
    "enum",
    "extension",
    "false",
    "for",
    "func",
    "guard",
    "if",
    "import",
    "in",
    "let",
    "nil",
    "protocol",
    "return",
    "self",
    "struct",
    "switch",
    "throw",
    "true",
    "try",
    "var",
    "while",
  ],
  rust: [
    "as",
    "break",
    "const",
    "continue",
    "crate",
    "else",
    "enum",
    "extern",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "pub",
    "ref",
    "return",
    "self",
    "static",
    "struct",
    "trait",
    "true",
    "type",
    "unsafe",
    "use",
    "where",
    "while",
  ],
  php: [
    "abstract",
    "array",
    "as",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "declare",
    "default",
    "echo",
    "else",
    "elseif",
    "extends",
    "final",
    "finally",
    "for",
    "foreach",
    "function",
    "if",
    "implements",
    "interface",
    "namespace",
    "new",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "switch",
    "throw",
    "trait",
    "try",
    "use",
    "while",
  ],
  ruby: [
    "begin",
    "break",
    "case",
    "class",
    "def",
    "do",
    "else",
    "elsif",
    "end",
    "ensure",
    "false",
    "for",
    "if",
    "in",
    "module",
    "next",
    "nil",
    "redo",
    "rescue",
    "retry",
    "return",
    "self",
    "super",
    "then",
    "true",
    "unless",
    "until",
    "when",
    "while",
    "yield",
  ],
  bash: [
    "case",
    "do",
    "done",
    "elif",
    "else",
    "esac",
    "fi",
    "for",
    "function",
    "if",
    "in",
    "select",
    "then",
    "until",
    "while",
  ],
  sql: [
    "ALTER",
    "AND",
    "AS",
    "BY",
    "CREATE",
    "DELETE",
    "DROP",
    "FROM",
    "GROUP",
    "HAVING",
    "INSERT",
    "INTO",
    "JOIN",
    "LEFT",
    "LIMIT",
    "NOT",
    "NULL",
    "ON",
    "OR",
    "ORDER",
    "RIGHT",
    "SELECT",
    "SET",
    "TABLE",
    "UPDATE",
    "VALUES",
    "WHERE",
  ],
};

const HTML_ESCAPE_PATTERN = /[&<>"']/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string) {
  return value.replace(HTML_ESCAPE_PATTERN, (match) => HTML_ESCAPE_MAP[match]);
}

function getTokenClass(token: string, language: string | undefined) {
  if (/^\/\/|^#|^--|^\/\*/.test(token)) return "text-[#7a7a7a]";
  if (/^(['"`]).*\1$/.test(token)) return "text-[#a3430a]";
  if (/^\d+(\.\d+)?$/.test(token)) return "text-[#0b7285]";
  if (/^<\/?[a-z][\w:-]*/i.test(token)) return "text-[#8a3ffc]";
  if (/^[{}()[\];,.]$/.test(token)) return "text-[#666]";

  const keywords = language ? KEYWORDS_BY_LANGUAGE[language] : undefined;
  if (keywords?.includes(token) || keywords?.includes(token.toUpperCase())) {
    return "text-[#5f3dc4] font-semibold";
  }

  return "";
}

const TOKEN_PATTERN =
  /(\/\/.*|#.*|--.*|\/\*[\s\S]*?\*\/|`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|<\/?[a-z][\w:-]*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|[{}()[\];,.])/g;

export function highlightCardEditorCodeHtml(
  code: string,
  language: string | undefined
) {
  let cursor = 0;
  let result = "";

  code.replace(TOKEN_PATTERN, (token, _match, offset: number) => {
    result += escapeHtml(code.slice(cursor, offset));
    const className = getTokenClass(token, language);
    result += className
      ? `<span class="${className}">${escapeHtml(token)}</span>`
      : escapeHtml(token);
    cursor = offset + token.length;
    return token;
  });

  return result + escapeHtml(code.slice(cursor));
}

export function renderCardEditorHighlightedCode(
  code: string,
  language: string | undefined
): ReactNode {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  code.replace(TOKEN_PATTERN, (token, _match, offset: number) => {
    if (offset > cursor) {
      nodes.push(code.slice(cursor, offset));
    }

    const className = getTokenClass(token, language);
    nodes.push(
      className ? (
        <YeonText
          key={`token-${index}`}
          as="span"
          variant="unstyled"
          tone="inherit"
          className={className}
        >
          {token}
        </YeonText>
      ) : (
        token
      )
    );
    index += 1;
    cursor = offset + token.length;
    return token;
  });

  if (cursor < code.length) {
    nodes.push(code.slice(cursor));
  }

  return nodes;
}
