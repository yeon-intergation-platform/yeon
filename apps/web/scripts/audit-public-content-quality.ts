import {
  PUBLIC_CONTENT_CALLOUT_TONES,
  PUBLIC_CONTENT_ARTICLES,
  PUBLIC_CONTENT_CHANNELS,
  type PublicContentArticle,
  type PublicContentBlock,
  getPublicContentSupportCtaTarget,
} from "../src/features/public-content/public-content-data";
import {
  getPublicContentSupportPrimaryActionItems,
  hasPublicContentSupportFaqHeadingStructure,
} from "../src/features/public-content/public-content-support-action-summary";
import { getPublicContentNewsArticleContext } from "../src/features/public-content/public-content-news-home";
import {
  getPublicContentNewsDetailSections,
  hasPublicContentNewsDetailSections,
} from "../src/features/public-content/public-content-news-detail";
import { getPublicContentTitleQualityWarnings } from "../src/features/public-content/public-content-title-quality";

type AuditIssue = {
  articleRef: string;
  message: string;
};

const SLUG_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FROZEN_SOURCE_PATTERN = /counseling|student-management|상담/i;
const PUBLIC_CONTENT_CALLOUT_TONE_VALUES = new Set<string>(
  Object.values(PUBLIC_CONTENT_CALLOUT_TONES)
);
const NEWS_NOTICE_REQUIRED_SECTIONS = [
  "무엇이 바뀌었나요",
  "사용자에게 영향이 있나요",
  "필요한 조치",
] as const;
const NEWS_UPDATES_REQUIRED_SECTIONS = [
  "변경 전",
  "변경 후",
  "관련 support 문서",
] as const;
const NEWS_INDUSTRY_REQUIRED_SECTIONS = [
  "YEON 서비스와의 관련성",
  "관련 blog 글",
] as const;

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

function auditSupportCta(issues: AuditIssue[], article: PublicContentArticle) {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.support) return;

  const expectedCta = getPublicContentSupportCtaTarget(article.service);
  if (!expectedCta) return;

  if (article.ctaLabel !== expectedCta.ctaLabel) {
    pushIssue(
      issues,
      article,
      `support ${article.service} CTA label이 정책과 다릅니다.`
    );
  }

  if (article.ctaHref !== expectedCta.ctaHref) {
    pushIssue(
      issues,
      article,
      `support ${article.service} CTA href가 정책과 다릅니다.`
    );
  }
}

function auditSupportActionStructure(
  issues: AuditIssue[],
  article: PublicContentArticle
) {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.support) return;

  if (!hasPublicContentSupportFaqHeadingStructure(article)) {
    pushIssue(
      issues,
      article,
      "support FAQ는 accordion 대신 색인 가능한 heading block을 포함해야 합니다."
    );
  }

  if (
    article.category !== "policy" &&
    getPublicContentSupportPrimaryActionItems(article).length === 0
  ) {
    pushIssue(
      issues,
      article,
      "support 글은 실제 해결 단계나 확인 목록을 먼저 드러낼 action block이 필요합니다."
    );
  }
}

function auditNewsArticleContext(
  issues: AuditIssue[],
  article: PublicContentArticle
) {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.news) return;

  const context = getPublicContentNewsArticleContext(article);
  if (!context) {
    pushIssue(
      issues,
      article,
      "news 글은 category별 상단 맥락 정보를 제공해야 합니다."
    );
  }
}

function auditNewsDetailSections(
  issues: AuditIssue[],
  article: PublicContentArticle
) {
  if (article.channel !== PUBLIC_CONTENT_CHANNELS.news) return;

  const requiredSectionsByCategory: Record<string, readonly string[]> = {
    news: NEWS_INDUSTRY_REQUIRED_SECTIONS,
    notice: NEWS_NOTICE_REQUIRED_SECTIONS,
    updates: NEWS_UPDATES_REQUIRED_SECTIONS,
  };
  const requiredSections = requiredSectionsByCategory[article.category];
  if (!requiredSections) return;

  if (!hasPublicContentNewsDetailSections(article, requiredSections)) {
    pushIssue(
      issues,
      article,
      `news ${article.category} detail 필수 섹션이 부족합니다.`
    );
  }

  const sections = getPublicContentNewsDetailSections(article);
  const supportSection = sections.find(
    (section) => section.title === "관련 support 문서"
  );
  if (
    article.category === "updates" &&
    !supportSection?.links?.some((link) =>
      link.href.startsWith("https://support.yeon.world")
    )
  ) {
    pushIssue(
      issues,
      article,
      "updates detail은 관련 support 문서 링크를 포함해야 합니다."
    );
  }

  const blogSection = sections.find(
    (section) => section.title === "관련 blog 글"
  );
  if (
    article.category === "news" &&
    !blogSection?.links?.some((link) =>
      link.href.startsWith("https://blog.yeon.world")
    )
  ) {
    pushIssue(
      issues,
      article,
      "업계 뉴스 detail은 관련 blog 글 링크를 포함해야 합니다."
    );
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
    if (block.tone && !PUBLIC_CONTENT_CALLOUT_TONE_VALUES.has(block.tone)) {
      pushIssue(
        issues,
        article,
        `${blockRef} callout tone 값이 올바르지 않습니다.`
      );
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

  auditSupportCta(issues, article);
  auditSupportActionStructure(issues, article);
  auditNewsArticleContext(issues, article);
  auditNewsDetailSections(issues, article);

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
