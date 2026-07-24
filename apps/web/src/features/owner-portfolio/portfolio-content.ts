export const PORTFOLIO_PROFILE = {
  name: "최현준",
  nameEn: "Choi Hyeonjun",
  role: "Backend Engineer",
  introduction:
    "사용자가 겪는 지연과 오류를 로그, DB, 실제 요청·응답으로 확인하고 원인에 맞는 코드와 운영 변경으로 해결합니다.",
} as const;

export const PORTFOLIO_DOCUMENTS = [
  {
    id: "portfolio",
    label: "포트폴리오 PDF",
    version: "v22 · 7페이지",
    description:
      "대표 프로젝트의 문제 정의, 해결 과정, 검증 수치를 정리했습니다.",
    href: "/documents/choi-hyeonjun-portfolio-v22.pdf",
    downloadName: "최현준_포트폴리오_v22.pdf",
  },
  {
    id: "resume",
    label: "이력서 PDF",
    version: "v21 · 2페이지",
    description: "기술 스택과 프로젝트 경험을 빠르게 확인할 수 있습니다.",
    href: "/documents/choi-hyeonjun-resume-v21.pdf",
    downloadName: "최현준_이력서_v21.pdf",
  },
] as const;

export const PORTFOLIO_EXTERNAL_LINKS = [
  {
    id: "github",
    label: "GitHub",
    value: "Hyeonjun0527",
    description: "코드와 공개 프로젝트 저장소",
    href: "https://github.com/Hyeonjun0527",
  },
  {
    id: "blog",
    label: "기술 블로그",
    value: "osumaniaddict527",
    description: "개발 과정과 문제 해결 기록",
    href: "https://osumaniaddict527.tistory.com",
  },
] as const;

export type PortfolioGalleryEntry = {
  id: string;
  sequence: string;
  title: string;
  category: string;
  period: string;
  summary: string;
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
};

export const PORTFOLIO_GALLERY_ENTRIES: readonly PortfolioGalleryEntry[] = [
  {
    id: "dailyting-video-startup",
    sequence: "01",
    title: "Dailyting — 영상 재생 시작 지연 개선",
    category: "미디어 처리",
    period: "2026.05 — 현재",
    summary:
      "MP4의 재생 정보가 파일 끝에 있어 첫 화면이 늦게 보이는 원인을 확인하고, 업로드 과정에 faststart 처리를 적용했습니다.",
  },
  {
    id: "nexa-response-control",
    sequence: "02",
    title: "NEXA — 대화 흐름을 보는 Discord AI",
    category: "응답 제어",
    period: "2026.04 — 현재",
    summary:
      "모든 메시지에 반응하지 않도록 관찰, 발화 판단, 관계 기록, 응답 생성을 독립된 책임으로 나눴습니다.",
  },
  {
    id: "yeon-ranking-performance",
    sequence: "03",
    title: "YEON Platform — 랭킹 API 병목 개선",
    category: "성능 개선",
    period: "2026.04 — 현재",
    summary:
      "매 요청마다 반복하던 전체 집계와 정렬을 측정해 병목을 확인하고, 짧은 TTL 캐시와 변경 시 무효화를 적용했습니다.",
  },
  {
    id: "pull-it-async-worker",
    sequence: "04",
    title: "PULL-IT — 긴 AI 작업을 Worker로 분리",
    category: "비동기 처리",
    period: "2025.09 — 2025.11",
    summary:
      "사용자 요청은 먼저 접수하고 AI 문제 생성은 RabbitMQ Worker가 처리하도록 상태와 완료 알림 흐름을 분리했습니다.",
    href: "/pull-it",
  },
  {
    id: "zero-one-study-matching",
    sequence: "05",
    title: "ZERO-ONE — 학습자 자동 매칭",
    category: "운영 자동화",
    period: "2025.01 — 2026.03",
    summary:
      "선호 정보를 수치화해 비슷한 참여자를 묶고, 가중치 기반 선택으로 같은 상대의 반복 가능성을 낮췄습니다.",
  },
  {
    id: "noon-member-domain",
    sequence: "06",
    title: "NOON — 지도 기반 SNS 회원 도메인",
    category: "도메인 구현",
    period: "2024.04 — 2024.07",
    summary:
      "회원가입부터 프로필, 팔로우, 차단까지 회원 기능의 API와 데이터 흐름을 맡아 구현했습니다.",
  },
  {
    id: "legacy-shopping-refactor",
    sequence: "07",
    title: "쇼핑몰 — Servlet/JSP 단계적 전환",
    category: "레거시 리팩토링",
    period: "2023.12 — 2024.04",
    summary:
      "화면, 업무 로직, SQL이 섞인 구조를 12단계로 나눠 Spring Boot 기반의 역할별 구조로 옮겼습니다.",
  },
];
