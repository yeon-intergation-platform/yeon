export const SITE_BRAND_NAME = "YEON";

export const SITE_SUPPORT_EMAIL = "hiclaudepro@gmail.com";

export const SITE_TITLE = `${SITE_BRAND_NAME} | 타자연습, 플래시카드 학습, 커뮤니티`;

export const SITE_DESCRIPTION = `${SITE_BRAND_NAME}에서 타자연습, 플래시카드 학습, 커뮤니티를 한곳에서 이용할 수 있습니다. 공통 계정으로 연결되며 각 서비스는 독립된 경험으로 바로 이동할 수 있습니다.`;

export const SITE_KEYWORDS = [
  "YEON",
  "yeon",
  "yeon world",
  "학생 관리",
  "타자연습",
  "플래시카드",
  "교육 서비스",
  "학습 서비스",
] as const;

export const SITE_PURPOSE_DESCRIPTION = `${SITE_BRAND_NAME}은 yeon.world 루트에서 여러 서비스를 열고, 공통 계정과 서비스별 경험을 함께 운영하는 멀티 서비스 플랫폼입니다.`;

export const GOOGLE_ACCOUNT_DATA_USAGE_DESCRIPTION =
  "Google 로그인 시 이름, 이메일, 프로필 이미지는 회원 식별과 로그인 유지에만 사용합니다. 사용자가 직접 Google Drive 연동을 시작한 경우에만 파일 가져오기를 위해 추가 권한을 요청합니다.";

export const BRAND_REVIEW_CONTACT_DESCRIPTION = `브랜드 문의와 계정 관련 요청은 ${SITE_SUPPORT_EMAIL}로 받습니다. 홈페이지, 정책 문서, OAuth 동의화면에서 같은 서비스명과 문의처를 사용합니다.`;

type SiteBrandLanguage = "ko" | "en";

const SITE_BRAND_TEXT: Record<
  SiteBrandLanguage,
  {
    title: string;
    description: string;
    keywords: readonly string[];
    openGraphLocale: string;
  }
> = {
  ko: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    keywords: SITE_KEYWORDS,
    openGraphLocale: "ko_KR",
  },
  en: {
    title: `${SITE_BRAND_NAME} | Typing practice, flashcards, and community`,
    description: `${SITE_BRAND_NAME} brings typing practice, flashcard study, and community services together under one account while keeping each service as its own focused experience.`,
    keywords: [
      "YEON",
      "yeon",
      "yeon world",
      "typing practice",
      "flashcards",
      "education service",
      "learning service",
      "community",
    ],
    openGraphLocale: "en_US",
  },
};

export function getSiteBrandText(language: SiteBrandLanguage) {
  return SITE_BRAND_TEXT[language];
}
