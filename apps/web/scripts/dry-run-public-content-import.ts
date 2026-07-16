import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

import {
  PUBLIC_CONTENT_STATUSES,
  publicContentImportManuscriptFrontmatterSchema,
  type PublicContentImportManuscriptFrontmatter,
  type PublicContentStatus,
} from "@yeon/api-contract/public-content";

import {
  getPublicContentArticleBySlug,
  PUBLIC_CONTENT_CATEGORY_LABELS,
} from "../src/features/public-content/public-content-data";

type FrontmatterValue = string | readonly string[];

type ManuscriptFrontmatter = PublicContentImportManuscriptFrontmatter;

export type ParsedPublicContentManuscript = {
  filePath: string;
  frontmatter: ManuscriptFrontmatter;
  body: string;
};

type ValidationMessage = {
  filePath: string;
  message: string;
};

type ContractIssue = {
  code: string;
  keys?: readonly PropertyKey[];
  message: string;
  path: readonly PropertyKey[];
};

type CliOptions = {
  inputDir: string;
  mode: PublicContentImportMode;
};

type ImportOperation = "create" | "update" | "skip";

type ImportOperationSummary = Record<ImportOperation, number>;

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

const PUBLIC_CONTENT_IMPORT_STATUSES = PUBLIC_CONTENT_STATUSES;

type PublicContentImportStatus = PublicContentStatus;

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

const CATEGORY_SET = new Set<string>(
  Object.keys(PUBLIC_CONTENT_CATEGORY_LABELS)
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

export function parsePublicContentFrontmatterBlock(
  block: string
): Record<string, FrontmatterValue> {
  let parsed: unknown;
  try {
    parsed = parseYaml(block, { maxAliasCount: 0 });
  } catch (error) {
    throw new Error(
      `frontmatter YAML을 해석하지 못했습니다: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("frontmatter는 YAML 객체여야 합니다.");
  }

  return Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => {
      if (value === null) return [key, []];
      if (Array.isArray(value)) {
        if (
          value.some(
            (item) =>
              item === null ||
              (typeof item !== "string" &&
                typeof item !== "number" &&
                typeof item !== "boolean")
          )
        ) {
          throw new Error(`${key} 목록에는 문자열 값만 사용할 수 있습니다.`);
        }
        return [key, value.map(String)];
      }
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return [key, String(value)];
      }
      throw new Error(
        `${key} frontmatter 값은 문자열 또는 문자열 목록이어야 합니다.`
      );
    })
  );
}

function formatContractIssue(issue: ContractIssue) {
  const fieldName = issue.path.map(String).join(".") || "frontmatter";

  if (issue.code === "unrecognized_keys") {
    return `허용되지 않는 frontmatter 필드: ${(issue.keys ?? []).map(String).join(", ")}`;
  }
  if (issue.code === "invalid_type") {
    return `${fieldName} 형식이 contract와 맞지 않습니다.`;
  }
  if (issue.code === "invalid_value") {
    return `${fieldName} 값이 허용되지 않습니다.`;
  }
  if (issue.code === "too_small") {
    return `${fieldName} 값이 비어 있거나 너무 짧습니다.`;
  }
  if (issue.code === "too_big") {
    return `${fieldName} 값이 너무 깁니다.`;
  }
  if (issue.code === "invalid_format") {
    return `${fieldName} 형식이 contract와 맞지 않습니다.`;
  }

  return `${fieldName}: ${issue.message}`;
}

function parseFrontmatterContract(
  frontmatterValues: Record<string, FrontmatterValue>
): ManuscriptFrontmatter {
  const parsed =
    publicContentImportManuscriptFrontmatterSchema.safeParse(frontmatterValues);

  if (!parsed.success) {
    throw new Error(
      `frontmatter contract 검증 실패: ${parsed.error.issues
        .map(formatContractIssue)
        .join("; ")}`
    );
  }

  return parsed.data;
}

export function parsePublicContentManuscript(
  filePath: string,
  fileContent: string
): ParsedPublicContentManuscript {
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

  const frontmatterValues = parsePublicContentFrontmatterBlock(
    lines.slice(1, closingIndex).join("\n")
  );

  REQUIRED_FIELDS.forEach((fieldName) => {
    if (!(fieldName in frontmatterValues)) {
      throw new Error(`${fieldName} frontmatter 필드가 없습니다.`);
    }
  });

  const frontmatter = parseFrontmatterContract(frontmatterValues);

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
  manuscript: ParsedPublicContentManuscript,
  errors: ValidationMessage[]
) {
  const { channel, service, category, slug } = manuscript.frontmatter;
  const slugSegments = getSlugSegments(slug);
  const articleSlug = slugSegments.at(-1);
  if (!articleSlug) {
    return;
  }

  const legacyFileName = `${channel}-${service}-${category}-${articleSlug}.md`;
  const exportFileName = `${channel}-${service}-${category}-${slug.replaceAll("/", "--")}.md`;
  const actualFileName = path.basename(manuscript.filePath);

  if (actualFileName !== legacyFileName && actualFileName !== exportFileName) {
    errors.push({
      filePath: manuscript.filePath,
      message: `파일명은 ${legacyFileName} 또는 ${exportFileName} 이어야 합니다.`,
    });
  }
}

function validateSlug(
  manuscript: ParsedPublicContentManuscript,
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
  manuscript: ParsedPublicContentManuscript,
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
  manuscript: ParsedPublicContentManuscript,
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
  manuscript: ParsedPublicContentManuscript,
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
  manuscript: ParsedPublicContentManuscript,
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
  manuscript: ParsedPublicContentManuscript,
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

function getImportOperation(
  manuscript: ParsedPublicContentManuscript
): ImportOperation {
  if (
    manuscript.frontmatter.status === PUBLIC_CONTENT_IMPORT_STATUSES.archived
  ) {
    return "skip";
  }

  const existingArticle = getPublicContentArticleBySlug(
    manuscript.frontmatter.channel,
    getSlugSegments(manuscript.frontmatter.slug)
  );

  return existingArticle ? "update" : "create";
}

function summarizeImportOperations(
  manuscripts: readonly ParsedPublicContentManuscript[]
): ImportOperationSummary {
  return manuscripts.reduce(
    (summary, manuscript) => {
      summary[getImportOperation(manuscript)] += 1;
      return summary;
    },
    { create: 0, skip: 0, update: 0 } satisfies ImportOperationSummary
  );
}

function validateManuscripts(
  manuscripts: readonly ParsedPublicContentManuscript[],
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
  const manuscripts: ParsedPublicContentManuscript[] = [];

  await Promise.all(
    markdownFiles.map(async (filePath) => {
      try {
        const fileContent = await readFile(filePath, "utf8");
        manuscripts.push(parsePublicContentManuscript(filePath, fileContent));
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
  const operations = summarizeImportOperations(manuscripts);

  console.log(
    `[public-content:import:dry-run] mode=${mode}, 원고 ${markdownFiles.length}개 검사, 생성 후보 ${operations.create}개, 수정 후보 ${operations.update}개, 건너뜀 ${operations.skip}개, 경고 ${warnings.length}개, 실패 ${errors.length}개`
  );
  printMessages("경고", warnings);
  printMessages("실패", errors);

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(
      `[public-content:import:dry-run] 실행 실패: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exitCode = 1;
  });
}
