import {
  TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS,
  TYPING_PASSAGE_TEXT_MAX_LENGTH,
} from "@yeon/api-contract/typing-decks";

export { TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS, TYPING_PASSAGE_TEXT_MAX_LENGTH };

export type ParsedBulkTypingPassage = {
  title?: string;
  prompt: string;
};

export type BulkTypingPassageImportParseResult = {
  passages: ParsedBulkTypingPassage[];
  errors: string[];
  warnings: string[];
};

const PASSAGE_MARKER = "[[PASSAGE]]";
const TITLE_MARKER = "[[TITLE]]";
const TEXT_MARKER = "[[TEXT]]";
const MARKERS = [PASSAGE_MARKER, TITLE_MARKER, TEXT_MARKER] as const;
const ESCAPED_MARKERS = new Map(
  MARKERS.map((marker) => [`\\${marker}`, marker]),
);

type ActiveSection = "title" | "text" | null;

type DraftPassage = {
  titleLines: string[];
  textLines: string[];
  startLine: number;
  sawTextMarker: boolean;
};

function normalizeLines(source: string): string[] {
  return source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
}

function getMarker(line: string): (typeof MARKERS)[number] | null {
  const trimmed = line.trim();
  return MARKERS.find((marker) => trimmed === marker) ?? null;
}

function unescapeMarkerContent(line: string): string {
  const trimmed = line.trim();
  const unescaped = ESCAPED_MARKERS.get(trimmed);
  if (!unescaped) {
    return line;
  }
  return line.replace(`\\${unescaped}`, unescaped);
}

function hasContent(draft: DraftPassage | null): boolean {
  if (!draft) {
    return false;
  }
  return (
    draft.titleLines.some((line) => line.trim().length > 0) ||
    draft.textLines.some((line) => line.trim().length > 0)
  );
}

function appendContent(
  draft: DraftPassage | null,
  section: ActiveSection,
  line: string,
  lineNumber: number,
  errors: string[],
): DraftPassage | null {
  if (!draft || !section) {
    if (line.trim().length > 0) {
      errors.push(
        `${lineNumber}번째 줄: [[TITLE]] 또는 [[TEXT]] 마커 밖의 내용은 문단으로 만들 수 없습니다.`,
      );
    }
    return draft;
  }

  const contentLine = unescapeMarkerContent(line);
  if (section === "title") {
    draft.titleLines.push(contentLine);
    return draft;
  }
  draft.textLines.push(contentLine);
  return draft;
}

function finalizeDraft(params: {
  draft: DraftPassage | null;
  lineNumber: number;
  passages: ParsedBulkTypingPassage[];
  errors: string[];
}) {
  const { draft, lineNumber, passages, errors } = params;
  if (!draft || !hasContent(draft)) {
    return;
  }

  const title = draft.titleLines.join("\n").trim();
  const prompt = draft.textLines.join("\n").trim();

  if (!draft.sawTextMarker || !prompt) {
    errors.push(
      `${draft.startLine}번째 줄에서 시작한 문단: 본문([[TEXT]])을 입력해주세요.`,
    );
    return;
  }

  if (prompt.length > TYPING_PASSAGE_TEXT_MAX_LENGTH) {
    errors.push(
      `${draft.startLine}번째 줄에서 시작한 문단: 본문은 ${TYPING_PASSAGE_TEXT_MAX_LENGTH}자 이하여야 합니다.`,
    );
    return;
  }

  if (passages.length >= TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS) {
    errors.push(
      `${lineNumber}번째 줄: 한 번에 최대 ${TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS}개 문단까지만 추가할 수 있습니다.`,
    );
    return;
  }

  passages.push(title ? { title, prompt } : { prompt });
}

function parseMarkerFormat(source: string): BulkTypingPassageImportParseResult {
  const passages: ParsedBulkTypingPassage[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = normalizeLines(source);
  let draft: DraftPassage | null = null;
  let section: ActiveSection = null;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const marker = getMarker(line);

    if (!marker) {
      draft = appendContent(draft, section, line, lineNumber, errors);
      return;
    }

    if (marker === PASSAGE_MARKER) {
      finalizeDraft({ draft, lineNumber, passages, errors });
      draft = {
        titleLines: [],
        textLines: [],
        startLine: lineNumber,
        sawTextMarker: false,
      };
      section = null;
      return;
    }

    if (marker === TITLE_MARKER) {
      if (hasContent(draft)) {
        finalizeDraft({ draft, lineNumber, passages, errors });
        warnings.push(
          `${lineNumber}번째 줄: 이전 문단 뒤에 [[PASSAGE]]가 없어도 새 [[TITLE]] 기준으로 문단을 나눴습니다.`,
        );
      }
      draft = {
        titleLines: [],
        textLines: [],
        startLine: lineNumber,
        sawTextMarker: false,
      };
      section = "title";
      return;
    }

    if (!draft) {
      draft = {
        titleLines: [],
        textLines: [],
        startLine: lineNumber,
        sawTextMarker: true,
      };
    }
    draft.sawTextMarker = true;
    section = "text";
  });

  finalizeDraft({ draft, lineNumber: lines.length, passages, errors });

  if (
    source.trim().length > 0 &&
    passages.length === 0 &&
    errors.length === 0
  ) {
    errors.push(
      "추가할 수 있는 문단이 없습니다. [[TEXT]] 형식을 확인해주세요.",
    );
  }

  return { passages, errors, warnings };
}

function parseParagraphFallback(
  source: string,
): BulkTypingPassageImportParseResult {
  const passages: ParsedBulkTypingPassage[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const groups = source
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split(/\n\s*\n+/)
    .map((group) => group.trim())
    .filter(Boolean);

  groups.forEach((prompt, index) => {
    if (prompt.length > TYPING_PASSAGE_TEXT_MAX_LENGTH) {
      errors.push(
        `${index + 1}번째 문단: 본문은 ${TYPING_PASSAGE_TEXT_MAX_LENGTH}자 이하여야 합니다.`,
      );
      return;
    }
    if (passages.length >= TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS) {
      errors.push(
        `한 번에 최대 ${TYPING_PASSAGE_BULK_IMPORT_MAX_ITEMS}개 문단까지만 추가할 수 있습니다.`,
      );
      return;
    }
    passages.push({ prompt });
  });

  if (passages.length > 0) {
    warnings.push(
      "마커가 없어 빈 줄 기준으로 문단 경계를 추정했습니다. 제목이 필요하면 [[TITLE]] 마커를 사용해주세요.",
    );
  }

  return { passages, errors, warnings };
}

export function parseBulkTypingPassageImportInput(
  source: string,
): BulkTypingPassageImportParseResult {
  if (!source.trim()) {
    return { passages: [], errors: [], warnings: [] };
  }

  const hasAnyMarker = normalizeLines(source).some(
    (line) => getMarker(line) !== null,
  );
  if (!hasAnyMarker) {
    return parseParagraphFallback(source);
  }

  return parseMarkerFormat(source);
}
