import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_CONTENT_CHANNELS,
  PUBLIC_CONTENT_CATEGORY_LABELS,
  PUBLIC_CONTENT_SERVICES,
  type PublicContentChannel,
  type PublicContentService,
} from "../src/features/public-content/public-content-data";

type FrontmatterValue = string | readonly string[];

type ManuscriptFrontmatter = {
  title: string;
  description: string;
  channel: PublicContentChannel;
  service: PublicContentService;
  category: string;
  slug: string;
  status: PublicContentImportStatus;
  source_repo: string;
  source_path: readonly string[];
};

type ParsedManuscript = {
  filePath: string;
  frontmatter: ManuscriptFrontmatter;
  body: string;
};

type ValidationMessage = {
  filePath: string;
  message: string;
};

type CliOptions = {
  inputDir: string;
  mode: PublicContentImportMode;
};

const DEFAULT_INPUT_DIR = "docs/public-content/articles";

const REQUIRED_FIELDS = [
  "title",
  "description",
  "channel",
  "service",
  "category",
  "slug",
  "status",
  "source_repo",
  "source_path",
] as const;

const PUBLIC_CONTENT_IMPORT_STATUSES = {
  draft: "draft",
  review: "review",
  published: "published",
  archived: "archived",
} as const;

type PublicContentImportStatus =
  (typeof PUBLIC_CONTENT_IMPORT_STATUSES)[keyof typeof PUBLIC_CONTENT_IMPORT_STATUSES];

const PUBLIC_CONTENT_IMPORT_MODES = {
  draft: "draft",
  publish: "publish",
  all: "all",
} as const;

type PublicContentImportMode =
  (typeof PUBLIC_CONTENT_IMPORT_MODES)[keyof typeof PUBLIC_CONTENT_IMPORT_MODES];

const MODE_STATUS_RULES = {
  draft: new Set<string>([
    PUBLIC_CONTENT_IMPORT_STATUSES.draft,
    PUBLIC_CONTENT_IMPORT_STATUSES.review,
  ]),
  publish: new Set<string>([PUBLIC_CONTENT_IMPORT_STATUSES.published]),
  all: new Set<string>(Object.values(PUBLIC_CONTENT_IMPORT_STATUSES)),
} as const satisfies Record<PublicContentImportMode, ReadonlySet<string>>;

const CHANNEL_SET = new Set<string>(Object.values(PUBLIC_CONTENT_CHANNELS));
const SERVICE_SET = new Set<string>(Object.values(PUBLIC_CONTENT_SERVICES));
const CATEGORY_SET = new Set<string>(
  Object.keys(PUBLIC_CONTENT_CATEGORY_LABELS)
);
const STATUS_SET = new Set<string>(
  Object.values(PUBLIC_CONTENT_IMPORT_STATUSES)
);
const SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FRONTMATTER_BOUNDARY_PATTERN = /^---\s*$/;
const EMPTY_HEADING_PATTERN = /^#{1,6}\s*$/m;
const EXTERNAL_LINK_PATTERN = /https?:\/\//;
const MARKDOWN_LINK_PATTERN = /\[[^\]]*]\(https?:\/\/[^)]+\)/g;
const URL_PATTERN = /https?:\/\/\S+/g;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "../../..");

function asMode(value: string): PublicContentImportMode {
  if (
    !Object.values(PUBLIC_CONTENT_IMPORT_MODES).includes(
      value as PublicContentImportMode
    )
  ) {
    throw new Error(`mode 값이 허용되지 않습니다: ${value}`);
  }
  return value as PublicContentImportMode;
}

function getCliOptions(): CliOptions {
  let inputDirArg: string | undefined;
  let mode: PublicContentImportMode = PUBLIC_CONTENT_IMPORT_MODES.draft;

  process.argv.slice(2).forEach((arg) => {
    if (arg === "--") {
      return;
    }

    if (arg.startsWith("--mode=")) {
      mode = asMode(arg.slice("--mode=".length));
      return;
    }

    if (arg.startsWith("--")) {
      throw new Error(`지원하지 않는 옵션입니다: ${arg}`);
    }

    if (inputDirArg) {
      throw new Error(`입력 디렉터리는 하나만 지정할 수 있습니다: ${arg}`);
    }

    inputDirArg = arg;
  });

  if (inputDirArg && path.isAbsolute(inputDirArg)) {
    return { inputDir: inputDirArg, mode };
  }
  return {
    inputDir: path.resolve(REPO_ROOT, inputDirArg ?? DEFAULT_INPUT_DIR),
    mode,
  };
}

async function findMarkdownFiles(inputDir: string): Promise<string[]> {
  let entries;

  try {
    entries = await readdir(inputDir, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error(`원고 디렉터리를 찾을 수 없습니다: ${inputDir}`);
    }
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(inputDir, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(entryPath);
      }
      if (
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        entry.name !== "README.md"
      ) {
        return [entryPath];
      }
      return [];
    })
  );

  return files.flat().sort();
}

function stripQuotes(value: string) {
  const trimmedValue = value.trim();
  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1);
  }
  return trimmedValue;
}

function parseFrontmatterBlock(
  block: string
): Record<string, FrontmatterValue> {
  const values: Record<string, FrontmatterValue> = {};
  let currentListKey: string | undefined;

  block.split(/\r?\n/).forEach((line) => {
    if (line.trim().length === 0) {
      return;
    }

    const listItemMatch = line.match(/^\s*-\s+(.+)$/);
    if (listItemMatch && currentListKey) {
      const previousValue = values[currentListKey];
      const previousItems = Array.isArray(previousValue) ? previousValue : [];
      values[currentListKey] = [
        ...previousItems,
        stripQuotes(listItemMatch[1]),
      ];
      return;
    }

    const fieldMatch = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (!fieldMatch) {
      throw new Error(`지원하지 않는 frontmatter 줄입니다: ${line}`);
    }

    const [, key, rawValue = ""] = fieldMatch;
    const value = rawValue.trim();
    if (value.length === 0) {
      values[key] = [];
      currentListKey = key;
      return;
    }

    values[key] = stripQuotes(value);
    currentListKey = undefined;
  });

  return values;
}

function getStringField(
  values: Record<string, FrontmatterValue>,
  fieldName: (typeof REQUIRED_FIELDS)[number]
) {
  const value = values[fieldName];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} frontmatter 값이 비어 있습니다.`);
  }
  return value.trim();
}

function getStringListField(
  values: Record<string, FrontmatterValue>,
  fieldName: (typeof REQUIRED_FIELDS)[number]
) {
  const value = values[fieldName];
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return [value.trim()];
    }
    return [];
  }

  const items = value.map((item) => item.trim()).filter(Boolean);
  return items;
}

function asChannel(value: string): PublicContentChannel {
  if (!CHANNEL_SET.has(value)) {
    throw new Error(`channel 값이 허용되지 않습니다: ${value}`);
  }
  return value as PublicContentChannel;
}

function asService(value: string): PublicContentService {
  if (!SERVICE_SET.has(value)) {
    throw new Error(`service 값이 허용되지 않습니다: ${value}`);
  }
  return value as PublicContentService;
}

function asStatus(value: string): PublicContentImportStatus {
  if (!STATUS_SET.has(value)) {
    throw new Error(`status 값이 허용되지 않습니다: ${value}`);
  }
  return value as PublicContentImportStatus;
}

function parseManuscript(
  filePath: string,
  fileContent: string
): ParsedManuscript {
  const lines = fileContent.split(/\r?\n/);
  if (!FRONTMATTER_BOUNDARY_PATTERN.test(lines[0] ?? "")) {
    throw new Error("frontmatter 시작 구분자 --- 가 없습니다.");
  }

  const closingIndex = lines.findIndex(
    (line, index) => index > 0 && FRONTMATTER_BOUNDARY_PATTERN.test(line)
  );
  if (closingIndex === -1) {
    throw new Error("frontmatter 종료 구분자 --- 가 없습니다.");
  }

  const frontmatterValues = parseFrontmatterBlock(
    lines.slice(1, closingIndex).join("\n")
  );

  REQUIRED_FIELDS.forEach((fieldName) => {
    if (!(fieldName in frontmatterValues)) {
      throw new Error(`${fieldName} frontmatter 필드가 없습니다.`);
    }
  });

  const frontmatter: ManuscriptFrontmatter = {
    title: getStringField(frontmatterValues, "title"),
    description: getStringField(frontmatterValues, "description"),
    channel: asChannel(getStringField(frontmatterValues, "channel")),
    service: asService(getStringField(frontmatterValues, "service")),
    category: getStringField(frontmatterValues, "category"),
    slug: getStringField(frontmatterValues, "slug"),
    status: asStatus(getStringField(frontmatterValues, "status")),
    source_repo: getStringField(frontmatterValues, "source_repo"),
    source_path: getStringListField(frontmatterValues, "source_path"),
  };

  return {
    filePath,
    frontmatter,
    body: lines
      .slice(closingIndex + 1)
      .join("\n")
      .trim(),
  };
}

function getSlugSegments(slug: string) {
  return slug.split("/").filter(Boolean);
}

function validateFilename(
  manuscript: ParsedManuscript,
  errors: ValidationMessage[]
) {
  const { channel, service, category, slug } = manuscript.frontmatter;
  const slugSegments = getSlugSegments(slug);
  const articleSlug = slugSegments.at(-1);
  if (!articleSlug) {
    return;
  }

  const expectedFileName = `${channel}-${service}-${category}-${articleSlug}.md`;
  const actualFileName = path.basename(manuscript.filePath);

  if (actualFileName !== expectedFileName) {
    errors.push({
      filePath: manuscript.filePath,
      message: `파일명은 ${expectedFileName} 이어야 합니다.`,
    });
  }
}

function validateSlug(
  manuscript: ParsedManuscript,
  errors: ValidationMessage[]
) {
  const slugSegments = getSlugSegments(manuscript.frontmatter.slug);
  if (slugSegments.length === 0) {
    errors.push({
      filePath: manuscript.filePath,
      message: "slug가 비어 있습니다.",
    });
    return;
  }

  slugSegments.forEach((segment) => {
    if (!SLUG_SEGMENT_PATTERN.test(segment)) {
      errors.push({
        filePath: manuscript.filePath,
        message: `slug segment "${segment}"는 영문 소문자 kebab-case여야 합니다.`,
      });
    }
  });
}

function validateCategory(
  manuscript: ParsedManuscript,
  errors: ValidationMessage[]
) {
  if (CATEGORY_SET.has(manuscript.frontmatter.category)) {
    return;
  }

  errors.push({
    filePath: manuscript.filePath,
    message: `category 값이 허용되지 않습니다: ${manuscript.frontmatter.category}`,
  });
}

function validateStatusMode(
  manuscript: ParsedManuscript,
  mode: PublicContentImportMode,
  errors: ValidationMessage[]
) {
  if (MODE_STATUS_RULES[mode].has(manuscript.frontmatter.status)) {
    return;
  }

  errors.push({
    filePath: manuscript.filePath,
    message: `status ${manuscript.frontmatter.status} 원고는 --mode=${mode}에서 처리할 수 없습니다.`,
  });
}

function validateBody(
  manuscript: ParsedManuscript,
  errors: ValidationMessage[],
  warnings: ValidationMessage[]
) {
  if (manuscript.body.length === 0) {
    errors.push({
      filePath: manuscript.filePath,
      message: "본문이 비어 있습니다.",
    });
    return;
  }

  if (EMPTY_HEADING_PATTERN.test(manuscript.body)) {
    errors.push({
      filePath: manuscript.filePath,
      message: "빈 heading이 있습니다.",
    });
  }

  if (!EXTERNAL_LINK_PATTERN.test(manuscript.body)) {
    return;
  }

  const bodyWithoutLinks = manuscript.body
    .replace(MARKDOWN_LINK_PATTERN, "")
    .replace(URL_PATTERN, "")
    .replace(/[#>*_\-\d.`()[\]\s]/g, "");

  if (bodyWithoutLinks.length < 30) {
    warnings.push({
      filePath: manuscript.filePath,
      message: "본문이 외부 링크 중심입니다. 자체 설명을 보강하세요.",
    });
  }
}

function validateSourcePaths(
  manuscript: ParsedManuscript,
  warnings: ValidationMessage[]
) {
  if (manuscript.frontmatter.source_path.length === 0) {
    warnings.push({
      filePath: manuscript.filePath,
      message: "source_path가 비어 있습니다.",
    });
    return;
  }

  manuscript.frontmatter.source_path.forEach((sourcePath) => {
    if (sourcePath.trim().length === 0) {
      warnings.push({
        filePath: manuscript.filePath,
        message: "source_path에 빈 경로가 있습니다.",
      });
    }
  });
}

function validateDuplicateSlug(
  manuscript: ParsedManuscript,
  seenSlugs: Map<string, string>,
  errors: ValidationMessage[]
) {
  const slugKey = `${manuscript.frontmatter.channel}:${manuscript.frontmatter.slug}`;
  const previousFilePath = seenSlugs.get(slugKey);
  if (previousFilePath) {
    errors.push({
      filePath: manuscript.filePath,
      message: `channel 안에서 slug가 중복되었습니다. 기존 파일: ${previousFilePath}`,
    });
    return;
  }
  seenSlugs.set(slugKey, manuscript.filePath);
}

function validateManuscripts(
  manuscripts: readonly ParsedManuscript[],
  mode: PublicContentImportMode
) {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const seenSlugs = new Map<string, string>();

  manuscripts.forEach((manuscript) => {
    validateFilename(manuscript, errors);
    validateSlug(manuscript, errors);
    validateCategory(manuscript, errors);
    validateStatusMode(manuscript, mode, errors);
    validateBody(manuscript, errors, warnings);
    validateSourcePaths(manuscript, warnings);
    validateDuplicateSlug(manuscript, seenSlugs, errors);
  });

  return { errors, warnings };
}

function printMessages(label: string, messages: readonly ValidationMessage[]) {
  if (messages.length === 0) {
    return;
  }

  console.log(`${label}:`);
  messages.forEach((message) => {
    console.log(
      `- ${path.relative(REPO_ROOT, message.filePath)}: ${message.message}`
    );
  });
}

async function main() {
  const { inputDir, mode } = getCliOptions();
  const markdownFiles = await findMarkdownFiles(inputDir);
  const parseErrors: ValidationMessage[] = [];
  const manuscripts: ParsedManuscript[] = [];

  await Promise.all(
    markdownFiles.map(async (filePath) => {
      try {
        const fileContent = await readFile(filePath, "utf8");
        manuscripts.push(parseManuscript(filePath, fileContent));
      } catch (error) {
        parseErrors.push({
          filePath,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })
  );

  manuscripts.sort((a, b) => a.filePath.localeCompare(b.filePath));
  const validationResult = validateManuscripts(manuscripts, mode);
  const errors = [...parseErrors, ...validationResult.errors];
  const warnings = validationResult.warnings;

  console.log(
    `[public-content:import:dry-run] mode=${mode}, 원고 ${markdownFiles.length}개 검사, 생성 후보 ${manuscripts.length}개, 경고 ${warnings.length}개, 실패 ${errors.length}개`
  );
  printMessages("경고", warnings);
  printMessages("실패", errors);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(
    `[public-content:import:dry-run] 실행 실패: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
  process.exitCode = 1;
});
