export type TypingDifficulty = "starter" | "flow" | "burst";
export type TypingContentLocale = "ko" | "en";

export type TypingPassage = {
  id: string;
  difficulty: TypingDifficulty;
  title: string;
  description: string;
  prompt: string;
  targetSeconds: number;
  tags: string[];
};

export type TypingServiceFeature = {
  title: string;
  description: string;
};

export type TypingServiceFaq = {
  question: string;
  answer: string;
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

export const TYPING_PAGE_TITLE_EN = "YEON Typing | Free online typing practice";

export const TYPING_PAGE_DESCRIPTION_EN =
  "Practice typing in your browser, track speed and accuracy, then move into typing rooms and live races.";

export const TYPING_SEO_KEYWORDS_EN = [
  "typing practice",
  "free typing practice",
  "online typing test",
  "keyboard typing practice",
  "typing speed test",
  "typing accuracy test",
  "typing race",
] as const;

export const TYPING_SEO_HEADING = "YEON 타자연습 소개";

export const TYPING_SEO_INTRO = [
  "YEON 타자연습은 회원가입 없이 바로 시작하는 무료 한글 타자 연습 서비스입니다. 문장을 입력하면 정확도와 분당 타수, 경과 시간을 실시간으로 계산해 보여 줍니다.",
  "혼자 손을 푸는 개인 연습은 물론, 친구들과 타자방에 모여 함께 연습하거나 레이스로 서로의 속도를 겨룰 수 있습니다. 연습할 문장은 직접 추가해 나만의 덱으로 관리할 수 있습니다.",
] as const;

export const TYPING_FEATURES: readonly TypingServiceFeature[] = [
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

export const TYPING_FAQS: readonly TypingServiceFaq[] = [
  {
    question: "회원가입 없이 바로 연습할 수 있나요?",
    answer:
      "가능합니다. typing-service는 익명 진입을 기본으로 설계해 첫 방문에서도 바로 연습을 시작할 수 있습니다.",
  },
  {
    question: "어떤 내용으로 연습하나요?",
    answer:
      "QR 코드, 우주, 인터넷, 생물처럼 알아두면 쓸모 있고 의외성이 있는 지식을 길이별로 제공합니다.",
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

export const TYPING_PASSAGES = [
  {
    id: "curiosity-qr-recovery",
    difficulty: "starter",
    title: "QR 코드는 상처를 견딘다",
    description: "오류 정정으로 손상된 정보를 복원하는 원리",
    prompt:
      "QR 코드는 일부가 더럽혀지거나 손상돼도 오류 정정 기능으로 데이터를 복원할 수 있습니다. 가장 높은 일반 오류 정정 단계는 전체 코드워드의 최대 30퍼센트까지 복구하도록 설계됩니다.",
    targetSeconds: 48,
    tags: ["기술", "QR 코드", "오류 정정"],
  },
  {
    id: "curiosity-bluetooth-name",
    difficulty: "starter",
    title: "블루투스는 왕의 별명이었다",
    description: "무선 기술 이름과 로고에 숨은 역사",
    prompt:
      "블루투스라는 이름은 덴마크와 노르웨이를 통합한 하랄 블로탄 왕의 별명에서 왔습니다. 로고도 하랄의 이니셜 H와 B에 해당하는 두 룬 문자를 합친 모양입니다.",
    targetSeconds: 42,
    tags: ["기술", "역사", "블루투스"],
  },
  {
    id: "curiosity-first-website",
    difficulty: "starter",
    title: "최초의 웹사이트",
    description: "웹이 시작된 장소와 첫 페이지의 주제",
    prompt:
      "세계 최초의 웹사이트는 CERN에서 팀 버너스리가 사용하던 NeXT 컴퓨터에 열렸습니다. 그 사이트가 소개한 주제는 다름 아닌 월드 와이드 웹 프로젝트 자체였습니다.",
    targetSeconds: 40,
    tags: ["인터넷", "CERN", "웹"],
  },
  {
    id: "curiosity-mars-sunset",
    difficulty: "flow",
    title: "화성의 노을은 푸르다",
    description: "지구와 반대로 보이는 화성의 빛",
    prompt:
      "화성의 낮 하늘은 붉거나 주황빛이지만 해가 질 때 태양 주변은 푸른빛을 띱니다. 화성 대기의 미세한 먼지가 푸른빛을 태양 가까이에 남도록 산란시키기 때문입니다.",
    targetSeconds: 43,
    tags: ["우주", "화성", "빛"],
  },
  {
    id: "curiosity-atomic-second",
    difficulty: "flow",
    title: "1초를 만드는 숫자",
    description: "원자시계가 시간을 세는 기준",
    prompt:
      "국제단위계의 1초는 세슘 원자가 특정 상태를 오갈 때 생기는 복사의 주기를 91억 9263만 1770번 세는 시간으로 정의됩니다.",
    targetSeconds: 36,
    tags: ["과학", "시간", "원자시계"],
  },
  {
    id: "curiosity-octopus-hearts",
    difficulty: "flow",
    title: "문어에게는 심장이 세 개다",
    description: "두 개는 아가미로, 하나는 온몸으로",
    prompt:
      "문어를 포함한 두족류에게는 심장이 세 개 있습니다. 두 개는 산소가 부족한 피를 아가미로 보내고, 나머지 하나는 산소를 얻은 피를 온몸으로 보냅니다. 구리 기반 헤모시아닌 때문에 피는 푸른색입니다.",
    targetSeconds: 52,
    tags: ["생물", "문어", "두족류"],
  },
  {
    id: "curiosity-gps-relativity",
    difficulty: "burst",
    title: "GPS에는 상대성이론이 들어 있다",
    description: "스마트폰 위치를 지키는 시공간 보정",
    prompt:
      "GPS는 우주의 위성 시계와 지상의 시계를 함께 사용합니다. 빠른 이동과 중력 차이로 시간이 다르게 흐르는 상대론적 효과를 보정하지 않으면 지금처럼 정확한 위치를 계산할 수 없습니다.",
    targetSeconds: 45,
    tags: ["기술", "GPS", "상대성이론"],
  },
  {
    id: "curiosity-emoji-roots",
    difficulty: "burst",
    title: "이모지는 일본 통신사에서 세계 표준으로",
    description: "휴대전화 그림문자가 유니코드에 들어온 과정",
    prompt:
      "오늘날 쓰는 많은 이모지의 뿌리는 일본 이동통신사의 그림문자 세트에 있습니다. 2010년 유니코드 6.0에 일본 통신사 출신 이모지 수백 개가 포함되면서 여러 기기에서 같은 문자를 주고받을 기반이 생겼습니다.",
    targetSeconds: 50,
    tags: ["디지털 문화", "이모지", "유니코드"],
  },
] as const satisfies readonly TypingPassage[];

export const TYPING_PASSAGES_EN = [
  {
    id: "starter-clear-keys",
    difficulty: "starter",
    title: "Clear Key Warmup",
    description: "Short sentences for the first round",
    prompt:
      "Start with one clear sentence and keep a steady rhythm from the first key.",
    targetSeconds: 24,
    tags: ["Beginner", "Accuracy", "Short"],
  },
  {
    id: "flow-focus-en",
    difficulty: "flow",
    title: "Focused Flow",
    description: "A longer paragraph for rhythm practice",
    prompt:
      "Accuracy improves when your eyes move ahead of your hands. Read the next word early, keep your pace steady, and let the sentence finish cleanly.",
    targetSeconds: 45,
    tags: ["Intermediate", "Focus", "Paragraph"],
  },
  {
    id: "burst-sprint-en",
    difficulty: "burst",
    title: "Speed Sprint",
    description: "A short drill for raising pace",
    prompt:
      "Build speed without rushing. Hold the same rhythm, scan the next phrase, and let each key land with a clean beat.",
    targetSeconds: 38,
    tags: ["Speed", "Advanced", "Sprint"],
  },
] as const satisfies readonly TypingPassage[];

export const TYPING_FALLBACK_PASSAGE_BY_LOCALE: Record<
  TypingContentLocale,
  TypingPassage
> = {
  ko: TYPING_PASSAGES[0],
  en: TYPING_PASSAGES_EN[0],
};

export const TYPING_PASSAGES_BY_LOCALE: Record<
  TypingContentLocale,
  readonly TypingPassage[]
> = {
  ko: TYPING_PASSAGES,
  en: TYPING_PASSAGES_EN,
};

export const TYPING_DIFFICULTY_LABELS: Record<TypingDifficulty, string> = {
  starter: "스타터",
  flow: "플로우",
  burst: "버스트",
};

export const TYPING_DIFFICULTY_LABELS_BY_LOCALE: Record<
  TypingContentLocale,
  Record<TypingDifficulty, string>
> = {
  ko: TYPING_DIFFICULTY_LABELS,
  en: {
    starter: "Starter",
    flow: "Flow",
    burst: "Burst",
  },
};

const TYPING_SEO_HEADING_BY_LOCALE: Record<TypingContentLocale, string> = {
  ko: TYPING_SEO_HEADING,
  en: "About YEON Typing",
};

const TYPING_SEO_INTRO_BY_LOCALE: Record<
  TypingContentLocale,
  readonly string[]
> = {
  ko: TYPING_SEO_INTRO,
  en: [
    "YEON Typing is a free browser typing practice tool you can start without signing up. It measures speed, accuracy, progress, and elapsed time as you type.",
    "Practice alone, join a room with friends, or race other players in real time. You can also organize your own practice decks and reuse them whenever you want.",
  ],
};

const TYPING_FEATURES_BY_LOCALE: Record<
  TypingContentLocale,
  readonly TypingServiceFeature[]
> = {
  ko: TYPING_FEATURES,
  en: [
    {
      title: "Solo Practice",
      description:
        "Train accuracy and speed with short prompts, longer passages, and sprint drills.",
    },
    {
      title: "Live Typing Rooms",
      description:
        "Practice in the same room with friends and compare progress in real time.",
    },
    {
      title: "Typing Race",
      description:
        "Type the same prompt against other players and watch the race unfold live.",
    },
    {
      title: "Practice Decks",
      description:
        "Create and manage your own prompt sets for focused repeat practice.",
    },
  ],
};

const TYPING_FAQS_BY_LOCALE: Record<
  TypingContentLocale,
  readonly TypingServiceFaq[]
> = {
  ko: TYPING_FAQS,
  en: [
    {
      question: "Can I practice without signing up?",
      answer:
        "Yes. YEON Typing supports anonymous entry, so first-time visitors can start practicing right away.",
    },
    {
      question: "What prompts do I practice with?",
      answer:
        "The service rotates short sentences, longer explanatory passages, and speed-focused prompts so you can train both rhythm and accuracy.",
    },
    {
      question: "How do I check speed and accuracy?",
      answer:
        "Speed, accuracy, progress, and elapsed time update as soon as you begin typing.",
    },
    {
      question: "Can I move from practice into multiplayer?",
      answer:
        "Yes. The typing home screen connects solo practice, room entry, and race play from the same service surface.",
    },
  ],
};

export function getTypingServiceHelpContent(locale: TypingContentLocale) {
  return {
    title: TYPING_SEO_HEADING_BY_LOCALE[locale],
    intro: TYPING_SEO_INTRO_BY_LOCALE[locale],
    features: TYPING_FEATURES_BY_LOCALE[locale],
    faqs: TYPING_FAQS_BY_LOCALE[locale],
  };
}
