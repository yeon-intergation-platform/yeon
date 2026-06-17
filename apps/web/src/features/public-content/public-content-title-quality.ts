import type {
  PublicContentChannel,
  PublicContentService,
} from "./public-content-data";

type PublicContentTitleQualityInput = {
  channel: PublicContentChannel;
  serviceKey: string;
  title: string;
};

const GENERIC_TITLES = new Set([
  "가이드",
  "nexa 가이드",
  "오류 해결",
  "권한 안내",
  "사용법",
  "업데이트 소식",
  "새 소식",
  "공지",
  "회고",
  "기술 글",
  "개발 이야기",
]);

const SERVICE_TITLE_KEYWORDS = {
  nexa: ["NEXA", "디스코드", "AI", "봇", "서버"],
  typing: ["typing.yeon.world", "타자", "연습", "타자방", "레이스"],
  card: ["card.yeon.world", "플래시카드", "카드", "덱", "복습"],
  community: ["community.yeon.world", "커뮤니티", "글", "댓글", "닉네임"],
  account: ["YEON", "계정", "로그인", "개인정보", "서비스", "공개 URL"],
} as const satisfies Record<PublicContentService, readonly string[]>;

const SUPPORT_INTENT_KEYWORDS = [
  "방법",
  "확인",
  "해결",
  "설정",
  "필요",
  "사용",
  "제거",
  "추가",
  "시작",
  "접속",
  "응답",
  "답변",
  "제외",
  "권한",
  "처리",
  "어디서",
  "때",
  "무엇까지",
  "등록",
  "저장",
  "신고",
];

const NEWS_SUBJECT_KEYWORDS = [
  "YEON",
  "NEXA",
  "support.yeon.world",
  "news.yeon.world",
  "blog.yeon.world",
  "typing.yeon.world",
  "card.yeon.world",
  "community.yeon.world",
  "디스코드",
  "타자",
  "플래시카드",
  "커뮤니티",
];

const NEWS_FACT_KEYWORDS = [
  "안내",
  "공개",
  "추가",
  "분리",
  "오픈",
  "업데이트",
  "운영",
  "문서",
];

const BLOG_CONTEXT_KEYWORDS = [
  "왜",
  "이유",
  "문제",
  "설계",
  "운영",
  "구조",
  "필요",
  "고려",
  "관점",
  "시작",
  "분리",
];
const EMPTY_TITLE_KEYWORDS: readonly string[] = [];

function normalizeForMatch(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function includesAnyKeyword(value: string, keywords: readonly string[]) {
  const normalizedValue = normalizeForMatch(value);

  return keywords.some((keyword) =>
    normalizedValue.includes(normalizeForMatch(keyword))
  );
}

function getServiceTitleKeywords(serviceKey: string) {
  if (serviceKey in SERVICE_TITLE_KEYWORDS) {
    return SERVICE_TITLE_KEYWORDS[serviceKey as PublicContentService];
  }

  return EMPTY_TITLE_KEYWORDS;
}

export function getPublicContentTitleQualityWarnings(
  input: PublicContentTitleQualityInput
): string[] {
  const title = input.title.trim();
  const warnings: string[] = [];

  if (!title) {
    return ["title 누락"];
  }

  if (GENERIC_TITLES.has(normalizeForMatch(title))) {
    warnings.push("title generic");
  }

  if (title.length < 10) {
    warnings.push("title 너무 짧음");
  }

  if (title.length > 72) {
    warnings.push("title 너무 김");
  }

  if (input.channel === "support") {
    const serviceKeywords = getServiceTitleKeywords(input.serviceKey);

    if (
      serviceKeywords.length > 0 &&
      !includesAnyKeyword(title, serviceKeywords)
    ) {
      warnings.push("title 서비스 단서 누락");
    }

    if (!includesAnyKeyword(title, SUPPORT_INTENT_KEYWORDS)) {
      warnings.push("title 검색 행동/문제 표현 누락");
    }
  }

  if (input.channel === "news") {
    if (!includesAnyKeyword(title, NEWS_SUBJECT_KEYWORDS)) {
      warnings.push("title 공지 대상 누락");
    }

    if (!includesAnyKeyword(title, NEWS_FACT_KEYWORDS)) {
      warnings.push("title 공지/업데이트 성격 누락");
    }
  }

  if (
    input.channel === "blog" &&
    !includesAnyKeyword(title, BLOG_CONTEXT_KEYWORDS)
  ) {
    warnings.push("title 결정 맥락 누락");
  }

  return warnings;
}
