import {
  PUBLIC_CONTENT_ARTICLES,
  type PublicContentArticle,
  type PublicContentBlock,
} from "../src/features/public-content/public-content-data";
import { getPublicContentTitleQualityWarnings } from "../src/features/public-content/public-content-title-quality";

type AuditIssue = {
  articleRef: string;
  message: string;
};

const SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FROZEN_SOURCE_PATTERN = /counseling|student-management|상담/i;

function getArticleRef(article: PublicContentArticle) {
  return `${article.channel}:${article.slugSegments.join("/")}`;
}

function isBlank(value: string) {
  return value.trim().length === 0;
}

function isValidDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function isPositiveDimension(value: number) {
  return Number.isInteger(value) && value > 0;
}

function pushIssue(
  issues: AuditIssue[],
  article: PublicContentArticle,
  message: string
) {
  issues.push({
    articleRef: getArticleRef(article),
    message,
  });
}

function auditTextField(
  issues: AuditIssue[],
  article: PublicContentArticle,
  fieldName: string,
  value: string
) {
  if (isBlank(value)) {
    pushIssue(issues, article, `${fieldName} 값이 비어 있습니다.`);
  }
}

function auditBodyBlock(
  issues: AuditIssue[],
  article: PublicContentArticle,
  block: PublicContentBlock,
  index: number
) {
  const blockRef = `body[${index}]`;

  if (block.type === "paragraph" && isBlank(block.text)) {
    pushIssue(issues, article, `${blockRef} paragraph text가 비어 있습니다.`);
    return;
  }

  if (block.type === "heading" && isBlank(block.title)) {
    pushIssue(issues, article, `${blockRef} heading title이 비어 있습니다.`);
    return;
  }

  if (block.type === "callout") {
    if (isBlank(block.title)) {
      pushIssue(issues, article, `${blockRef} callout title이 비어 있습니다.`);
    }
    if (isBlank(block.text)) {
      pushIssue(issues, article, `${blockRef} callout text가 비어 있습니다.`);
    }
    return;
  }

  if (block.type === "image") {
    if (isBlank(block.src)) {
      pushIssue(issues, article, `${blockRef} image src가 비어 있습니다.`);
    }
    if (isBlank(block.alt)) {
      pushIssue(issues, article, `${blockRef} image alt가 비어 있습니다.`);
    }
    if (!isPositiveDimension(block.width)) {
      pushIssue(
        issues,
        article,
        `${blockRef} image width가 올바르지 않습니다.`
      );
    }
    if (!isPositiveDimension(block.height)) {
      pushIssue(
        issues,
        article,
        `${blockRef} image height가 올바르지 않습니다.`
      );
    }
    return;
  }

  if (block.type === "code") {
    if (isBlank(block.language)) {
      pushIssue(issues, article, `${blockRef} code language가 비어 있습니다.`);
    }
    if (isBlank(block.code)) {
      pushIssue(issues, article, `${blockRef} code 내용이 비어 있습니다.`);
    }
    return;
  }

  if (block.type !== "steps" && block.type !== "checklist") {
    return;
  }

  if (block.items.length === 0) {
    pushIssue(issues, article, `${blockRef} ${block.type} items가 없습니다.`);
    return;
  }

  block.items.forEach((item, itemIndex) => {
    if (isBlank(item)) {
      pushIssue(
        issues,
        article,
        `${blockRef} ${block.type} item[${itemIndex}]이 비어 있습니다.`
      );
    }
  });
}

function auditArticle(
  issues: AuditIssue[],
  seenSlugs: Set<string>,
  article: PublicContentArticle
) {
  auditTextField(issues, article, "title", article.title);
  auditTextField(issues, article, "description", article.description);
  auditTextField(issues, article, "summary", article.summary);

  getPublicContentTitleQualityWarnings({
    channel: article.channel,
    serviceKey: article.service,
    title: article.title,
  }).forEach((warning) => {
    pushIssue(issues, article, warning);
  });

  if (article.slugSegments.length === 0) {
    pushIssue(issues, article, "slugSegments가 비어 있습니다.");
  }

  article.slugSegments.forEach((segment) => {
    if (!SLUG_SEGMENT_PATTERN.test(segment)) {
      pushIssue(
        issues,
        article,
        `slug segment "${segment}"가 영문 소문자 kebab-case가 아닙니다.`
      );
    }
  });

  const slugKey = getArticleRef(article);
  if (seenSlugs.has(slugKey)) {
    pushIssue(issues, article, "channel 안에서 slug가 중복되었습니다.");
  }
  seenSlugs.add(slugKey);

  if (!isValidDate(article.publishedAt)) {
    pushIssue(issues, article, "publishedAt 날짜 형식이 올바르지 않습니다.");
  }
  if (!isValidDate(article.updatedAt)) {
    pushIssue(issues, article, "updatedAt 날짜 형식이 올바르지 않습니다.");
  }

  if (article.sourcePaths.length === 0) {
    pushIssue(issues, article, "sourcePaths가 비어 있습니다.");
  }

  article.sourcePaths.forEach((sourcePath) => {
    if (isBlank(sourcePath)) {
      pushIssue(issues, article, "sourcePaths에 빈 경로가 있습니다.");
    }
    if (FROZEN_SOURCE_PATTERN.test(sourcePath)) {
      pushIssue(
        issues,
        article,
        `동결된 상담 워크스페이스 source path가 포함되었습니다: ${sourcePath}`
      );
    }
  });

  if (article.body.length === 0) {
    pushIssue(issues, article, "body가 비어 있습니다.");
  }

  article.body.forEach((block, index) => {
    auditBodyBlock(issues, article, block, index);
  });
}

function main() {
  const issues: AuditIssue[] = [];
  const seenSlugs = new Set<string>();

  PUBLIC_CONTENT_ARTICLES.forEach((article) => {
    auditArticle(issues, seenSlugs, article);
  });

  if (issues.length === 0) {
    console.log(
      `[public-content:audit] OK - ${PUBLIC_CONTENT_ARTICLES.length}개 공개 콘텐츠 글 검사 통과`
    );
    return;
  }

  console.error(
    `[public-content:audit] FAIL - ${issues.length}개 품질 문제가 있습니다.`
  );
  issues.forEach((issue) => {
    console.error(`- ${issue.articleRef}: ${issue.message}`);
  });
  process.exitCode = 1;
}

main();
