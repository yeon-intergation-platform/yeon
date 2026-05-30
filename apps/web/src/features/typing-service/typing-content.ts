export type TypingDifficulty = "starter" | "flow" | "burst";

export type TypingPassage = {
  id: string;
  difficulty: TypingDifficulty;
  title: string;
  description: string;
  prompt: string;
  targetSeconds: number;
  tags: string[];
};

export const TYPING_PAGE_TITLE =
  "YEON 타자연습 | 로그인 없이 시작하는 한글 타자 연습";

export const TYPING_PAGE_DESCRIPTION =
  "YEON 타자연습에서 문장 입력으로 속도와 정확도를 확인하고, 개인 연습 뒤 타자방과 레이스까지 바로 이어서 이용할 수 있습니다.";

export const TYPING_SEO_KEYWORDS = [
  "타자연습",
  "한글 타자연습",
  "무료 타자연습",
  "온라인 타자연습",
  "키보드 타자연습",
  "타수 테스트",
  "타자 속도 테스트",
  "타자 정확도 테스트",
  "무료 한글 타자 테스트",
] as const;

export const TYPING_SEO_HEADING = "YEON 타자연습 소개";

export const TYPING_SEO_INTRO = [
  "YEON 타자연습은 회원가입 없이 바로 시작하는 무료 한글 타자 연습 서비스입니다. 문장을 입력하면 정확도와 분당 타수, 경과 시간을 실시간으로 계산해 보여 줍니다.",
  "혼자 손을 푸는 개인 연습은 물론, 친구들과 타자방에 모여 함께 연습하거나 레이스로 서로의 속도를 겨룰 수 있습니다. 연습할 문장은 직접 추가해 나만의 덱으로 관리할 수 있습니다.",
] as const;

export const TYPING_FEATURES = [
  {
    title: "개인 타자 연습",
    description:
      "짧은 문장부터 호흡 있는 문단, 속도 스프린트까지 난이도별 문장으로 정확도와 분당 타수를 측정합니다.",
  },
  {
    title: "실시간 타자방",
    description:
      "친구들과 같은 방에 모여 동시에 연습하고, 채팅으로 함께 기록을 확인합니다.",
  },
  {
    title: "타자 레이스",
    description:
      "다른 사용자와 같은 문장을 입력하며 실시간으로 타자 속도를 겨룹니다.",
  },
  {
    title: "연습 덱 관리",
    description:
      "연습할 문장을 직접 추가하고 나만의 연습 덱으로 정리해 반복합니다.",
  },
] as const;

export const TYPING_FAQS = [
  {
    question: "회원가입 없이 바로 연습할 수 있나요?",
    answer:
      "가능합니다. typing-service는 익명 진입을 기본으로 설계해 첫 방문에서도 바로 연습을 시작할 수 있습니다.",
  },
  {
    question: "어떤 문장으로 연습하나요?",
    answer:
      "짧은 문장, 호흡이 있는 설명문, 속도 중심 문장을 번갈아 제공해 정확도와 리듬을 함께 연습할 수 있게 구성합니다.",
  },
  {
    question: "타수와 정확도는 어떻게 보나요?",
    answer:
      "입력과 동시에 정확도, 진행률, 분당 타수, 경과 시간을 계산해 바로 보여 줍니다.",
  },
  {
    question: "검색 유입용 페이지와 실제 연습 화면이 분리되어 있나요?",
    answer:
      "첫 차수는 한 페이지 안에서 서비스 소개와 실제 연습을 함께 제공해 검색 유입 후 즉시 플레이까지 이어지도록 구성합니다.",
  },
] as const;

export const TYPING_PASSAGES: readonly TypingPassage[] = [
  {
    id: "starter-campus",
    difficulty: "starter",
    title: "짧고 또렷하게",
    description: "초반 손 풀기에 맞춘 짧은 문장",
    prompt:
      "오늘도 한 문장씩 정확하게 입력하면 손끝의 리듬이 조금씩 살아납니다.",
    targetSeconds: 24,
    tags: ["초보", "정확도", "짧은 문장"],
  },
  {
    id: "flow-focus",
    difficulty: "flow",
    title: "호흡 있는 문단",
    description: "집중력을 유지하며 리듬을 맞추는 연습",
    prompt:
      "빠르게 치는 것보다 중요한 건 흐름을 끊지 않는 일입니다. 눈으로 먼저 읽고 손은 조금 늦게 따라가면 오타가 줄고 문장이 더 안정적으로 이어집니다.",
    targetSeconds: 45,
    tags: ["중급", "집중", "문단"],
  },
  {
    id: "burst-sprint",
    difficulty: "burst",
    title: "속도 스프린트",
    description: "짧은 시간 안에 리듬과 속도를 올리는 연습",
    prompt:
      "리듬을 유지한 채 속도를 올리려면 손가락보다 시선이 먼저 움직여야 합니다. 다음 단어를 미리 읽고 박자를 놓치지 않으면 짧은 구간에서도 탄력이 붙습니다.",
    targetSeconds: 38,
    tags: ["속도", "상급", "스프린트"],
  },
] as const;

export const TYPING_DIFFICULTY_LABELS: Record<TypingDifficulty, string> = {
  starter: "스타터",
  flow: "플로우",
  burst: "버스트",
};
