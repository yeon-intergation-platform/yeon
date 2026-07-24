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
      "2025~2026년 우주 발견, AI, 인터넷 문화, 콘텐츠 기록처럼 최근 화제가 된 지식을 한 문장씩 제공합니다.",
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
    id: "trend-kpop-demon-hunters-views",
    difficulty: "starter",
    title: "넷플릭스를 휩쓴 K팝 애니메이션",
    description: "2025년 하반기 4억 8천만 회를 넘긴 작품",
    prompt:
      "넷플릭스의 케이팝 데몬 헌터스는 2025년 하반기에 4억 8200만 조회 수를 기록해 그 반년 동안 가장 많이 본 작품이 됐습니다.",
    targetSeconds: 38,
    tags: ["2025", "K팝", "콘텐츠"],
  },
  {
    id: "trend-kpop-lyric-videos",
    difficulty: "starter",
    title: "가사 영상만 3200만 회",
    description: "본편 밖에서도 이어진 K팝 열풍",
    prompt:
      "케이팝 데몬 헌터스의 공식 가사 영상들은 2025년 하반기에 넷플릭스에서만 합계 3200만 조회 수를 더했습니다.",
    targetSeconds: 34,
    tags: ["2025", "K팝", "음악"],
  },
  {
    id: "trend-netflix-non-english",
    difficulty: "starter",
    title: "자막의 장벽은 낮아졌다",
    description: "비영어권 작품이 차지한 시청 비중",
    prompt:
      "2025년 하반기 넷플릭스 전체 시청 시간의 3분의 1 이상은 영어가 아닌 언어로 만든 작품에서 나왔습니다.",
    targetSeconds: 32,
    tags: ["2025", "넷플릭스", "문화"],
  },
  {
    id: "trend-squid-game-season-three",
    difficulty: "starter",
    title: "오징어 게임의 마지막 질주",
    description: "시즌 3이 기록한 하반기 조회 수",
    prompt:
      "오징어 게임 시즌 3은 2025년 하반기에 7900만 조회 수를 기록하며 한국 콘텐츠의 세계적인 관심을 다시 증명했습니다.",
    targetSeconds: 34,
    tags: ["2025", "오징어 게임", "콘텐츠"],
  },
  {
    id: "trend-google-tell-me-about",
    difficulty: "starter",
    title: "검색은 키워드에서 대화로",
    description: "설명을 부탁하는 검색이 급증한 해",
    prompt:
      "구글에서 영어로 무엇을 설명해 달라는 형태의 검색은 2025년에 전년보다 70퍼센트 늘어나 사상 최고치를 기록했습니다.",
    targetSeconds: 34,
    tags: ["2025", "구글", "검색"],
  },
  {
    id: "trend-google-how-do-i",
    difficulty: "starter",
    title: "사람들은 방법을 더 많이 물었다",
    description: "역대 최고치를 기록한 방법 검색",
    prompt:
      "구글에서 영어로 방법을 묻는 검색은 2025년에 25퍼센트 증가했고, 정품 라부부를 구별하는 법도 대표 질문이 됐습니다.",
    targetSeconds: 35,
    tags: ["2025", "구글", "라부부"],
  },
  {
    id: "trend-rage-bait",
    difficulty: "starter",
    title: "2025년의 단어는 분노 미끼",
    description: "화를 유도해 반응을 얻는 콘텐츠",
    prompt:
      "옥스퍼드가 2025년 올해의 단어로 고른 레이지 베이트는 분노를 유도해 클릭과 반응을 끌어내는 온라인 콘텐츠를 뜻합니다.",
    targetSeconds: 37,
    tags: ["2025", "인터넷 문화", "올해의 단어"],
  },
  {
    id: "trend-rage-bait-growth",
    difficulty: "starter",
    title: "레이지 베이트는 세 배 늘었다",
    description: "말의 사용량으로 드러난 온라인 피로",
    prompt:
      "옥스퍼드에 따르면 레이지 베이트라는 표현의 사용량은 2025년 선정 전 12개월 동안 세 배로 증가했습니다.",
    targetSeconds: 31,
    tags: ["2025", "인터넷 문화", "언어"],
  },
  {
    id: "trend-children-peace-ai",
    difficulty: "starter",
    title: "어린이들이 고른 평화와 AI",
    description: "2025년 영국 어린이들의 단어 투표",
    prompt:
      "영국 어린이 약 5000명이 참여한 2025년 단어 투표에서 평화가 35퍼센트, 인공지능이 33퍼센트로 나란히 상위에 올랐습니다.",
    targetSeconds: 37,
    tags: ["2025", "어린이", "AI"],
  },
  {
    id: "trend-spotify-bad-bunny",
    difficulty: "starter",
    title: "2025년 세계가 가장 많이 들은 가수",
    description: "스포티파이 정상으로 돌아온 배드 버니",
    prompt:
      "배드 버니는 2025년 스포티파이 전 세계 최다 스트리밍 아티스트와 최다 스트리밍 앨범을 동시에 차지했습니다.",
    targetSeconds: 32,
    tags: ["2025", "음악", "스포티파이"],
  },
  {
    id: "trend-unicode-seventeen",
    difficulty: "flow",
    title: "문자는 지금도 새로 생긴다",
    description: "유니코드 17.0이 늘린 세계의 문자",
    prompt:
      "2025년 공개된 유니코드 17.0은 네 개의 문자 체계를 포함해 4803개 문자를 추가했고, 전체 문자 수는 15만 9801개가 됐습니다.",
    targetSeconds: 39,
    tags: ["2025", "유니코드", "언어"],
  },
  {
    id: "trend-emoji-seventeen",
    difficulty: "flow",
    title: "새 이모지는 일곱 개에서 퍼진다",
    description: "피부색 조합으로 크게 늘어나는 이모지 수",
    prompt:
      "2025년 이모지 17.0은 털복숭이 생물과 범고래 등 기본 이모지 일곱 개를 더했고, 변형과 조합을 합치면 새 표현은 163개입니다.",
    targetSeconds: 39,
    tags: ["2025", "이모지", "유니코드"],
  },
  {
    id: "trend-chatgpt-nine-hundred-million",
    difficulty: "flow",
    title: "주간 사용자 9억 명",
    description: "2026년 발표된 ChatGPT의 이용 규모",
    prompt:
      "오픈AI는 2026년 4월 기준으로 전 세계에서 매주 9억 명이 ChatGPT를 사용한다고 발표했습니다.",
    targetSeconds: 29,
    tags: ["2026", "AI", "ChatGPT"],
  },
  {
    id: "trend-chatgpt-usage-depth",
    difficulty: "flow",
    title: "AI는 쓸수록 용도가 늘었다",
    description: "가입 6개월 뒤 달라진 사용 습관",
    prompt:
      "2026년 오픈AI 분석에서 가입 6개월이 지난 사용자는 가입 당시보다 하루 메시지를 50퍼센트 더 보내고, 시도한 작업 종류는 두 배가 됐습니다.",
    targetSeconds: 42,
    tags: ["2026", "AI", "사용 습관"],
  },
  {
    id: "trend-chatgpt-non-english",
    difficulty: "flow",
    title: "AI 대화의 절반 이상은 비영어",
    description: "더 넓어진 ChatGPT의 언어권",
    prompt:
      "2026년 오픈AI 집계에서 영어가 아닌 언어를 주로 쓰는 사람은 ChatGPT 전체 활성 사용자의 절반을 넘었습니다.",
    targetSeconds: 32,
    tags: ["2026", "AI", "언어"],
  },
  {
    id: "trend-chatgpt-everyday-use",
    difficulty: "flow",
    title: "AI 대화의 70퍼센트는 일 밖에서",
    description: "코딩보다 넓은 일상 속 인공지능",
    prompt:
      "2025년 150만 건의 대화를 분석한 연구에서는 ChatGPT 소비자 사용의 약 70퍼센트가 업무 밖의 일상적인 용도였습니다.",
    targetSeconds: 35,
    tags: ["2025", "AI", "일상"],
  },
  {
    id: "trend-codex-three-million",
    difficulty: "flow",
    title: "코딩 에이전트 주간 사용자 300만 명",
    description: "2026년에 커진 AI 개발 도구",
    prompt:
      "오픈AI는 2026년 4월 코딩 에이전트 Codex의 주간 활성 사용자가 300만 명에 도달했다고 밝혔습니다.",
    targetSeconds: 31,
    tags: ["2026", "AI", "코딩"],
  },
  {
    id: "trend-spherex-cosmic-map",
    difficulty: "flow",
    title: "우주를 102가지 색으로 칠하다",
    description: "SPHEREx가 완성한 첫 전천 적외선 지도",
    prompt:
      "2025년 NASA의 SPHEREx 우주망원경은 6개월 동안 온 하늘을 돌며 인간의 눈에는 보이지 않는 적외선 102가지 색으로 첫 우주 지도를 만들었습니다.",
    targetSeconds: 44,
    tags: ["2025", "우주", "SPHEREx"],
  },
  {
    id: "trend-rubin-asteroids",
    difficulty: "flow",
    title: "10시간 만에 소행성 2000개",
    description: "루빈 천문대의 첫 공개 관측",
    prompt:
      "베라 루빈 천문대는 2025년 처음 공개한 관측에서 단 10시간의 데이터로 이전에 알려지지 않은 소행성 2000개 이상을 찾아냈습니다.",
    targetSeconds: 41,
    tags: ["2025", "우주", "소행성"],
  },
  {
    id: "trend-euclid-thirty-million",
    difficulty: "flow",
    title: "첫 공개 자료에 천체 3000만 개",
    description: "유클리드가 펼친 우주의 예고편",
    prompt:
      "유럽우주국의 유클리드 망원경은 2025년 첫 공개 자료에서 하늘 63제곱도에 담긴 약 3000만 개의 천체를 선보였습니다.",
    targetSeconds: 38,
    tags: ["2025", "우주", "유클리드"],
  },
  {
    id: "trend-jupiter-aurora",
    difficulty: "burst",
    title: "목성의 오로라는 수백 배 밝다",
    description: "웹 망원경이 포착한 거대한 빛",
    prompt:
      "2025년 제임스 웹 우주망원경 관측에서 목성의 오로라는 지구의 오로라보다 수백 배 더 밝고 빠르게 변하는 모습으로 나타났습니다.",
    targetSeconds: 39,
    tags: ["2025", "우주", "목성"],
  },
  {
    id: "trend-diamond-cloud-exoplanet",
    difficulty: "burst",
    title: "다이아몬드 구름이 내릴지도 모르는 행성",
    description: "설명하기 어려운 탄소 행성의 대기",
    prompt:
      "2025년 웹 망원경이 관측한 외계행성 PSR J2322-2650b는 헬륨과 탄소가 풍부해, 상층 대기에서 다이아몬드 결정이 응결할 가능성이 제시됐습니다.",
    targetSeconds: 46,
    tags: ["2025", "우주", "외계행성"],
  },
  {
    id: "trend-alpha-centauri-candidate",
    difficulty: "burst",
    title: "가장 가까운 이웃 별의 사라진 행성",
    description: "한 번 보인 뒤 다시 숨은 외계행성 후보",
    prompt:
      "2025년 웹 망원경은 약 4광년 거리의 알파 센타우리 A 주변에서 가스 행성 후보를 포착했지만, 다음 관측에서는 궤도 위치가 달라져 다시 보이지 않았습니다.",
    targetSeconds: 45,
    tags: ["2025", "우주", "알파 센타우리"],
  },
  {
    id: "trend-twa-seven-candidate",
    difficulty: "burst",
    title: "직접 찍힌 가장 가벼운 행성 후보",
    description: "토성 정도 질량으로 추정되는 작은 점",
    prompt:
      "2025년 웹 망원경은 별 TWA 7의 원반에서 토성 정도 질량의 행성 후보를 포착해, 직접 촬영 방식으로 본 가장 가벼운 후보 기록을 세웠습니다.",
    targetSeconds: 43,
    tags: ["2025", "우주", "외계행성"],
  },
  {
    id: "trend-hr8799-carbon-dioxide",
    difficulty: "burst",
    title: "외계행성의 이산화탄소를 직접 보다",
    description: "젊은 거대 행성 네 개의 대기",
    prompt:
      "2025년 웹 망원경은 HR 8799 항성계의 거대 외계행성들을 직접 촬영하고, 대기에 이산화탄소가 풍부하다는 증거를 확인했습니다.",
    targetSeconds: 39,
    tags: ["2025", "우주", "외계행성"],
  },
  {
    id: "trend-uranus-new-moon",
    difficulty: "burst",
    title: "천왕성의 새 위성은 폭이 10킬로미터",
    description: "보이저도 놓친 아주 작은 달",
    prompt:
      "2025년 웹 망원경은 천왕성 주변에서 지름이 약 10킬로미터로 추정되는 작은 위성을 발견해, 알려진 천왕성의 위성을 29개로 늘렸습니다.",
    targetSeconds: 41,
    tags: ["2025", "우주", "천왕성"],
  },
  {
    id: "trend-asteroid-yr4",
    difficulty: "burst",
    title: "달 충돌 가능성이 사라진 소행성",
    description: "추가 관측으로 위험을 지운 2024 YR4",
    prompt:
      "NASA는 2026년 웹 망원경의 추가 관측으로 소행성 2024 YR4가 2032년에 달과 충돌할 가능성을 완전히 배제했습니다.",
    targetSeconds: 36,
    tags: ["2026", "우주", "소행성"],
  },
  {
    id: "trend-beta-pictoris-d",
    difficulty: "burst",
    title: "두 행성 사이에 숨은 세 번째 행성",
    description: "2026년 발견된 베타 픽토리스 d",
    prompt:
      "2026년 웹 망원경은 이미 알려진 두 거대 행성 사이의 밝은 별빛 속에서 세 번째 행성 베타 픽토리스 d를 찾아냈습니다.",
    targetSeconds: 36,
    tags: ["2026", "우주", "외계행성"],
  },
  {
    id: "trend-interstellar-comet-methane",
    difficulty: "burst",
    title: "태양계 밖 혜성에서 메탄을 찾다",
    description: "세 번째 성간 천체 3I/ATLAS의 지문",
    prompt:
      "2026년 웹 망원경은 태양계 밖에서 날아온 성간 혜성 3I/ATLAS에서 중적외선 화학 지문을 얻고 메탄을 검출했습니다.",
    targetSeconds: 38,
    tags: ["2026", "우주", "성간 혜성"],
  },
  {
    id: "trend-chatgpt-fastest-languages",
    difficulty: "burst",
    title: "가장 빠르게 늘어난 AI 언어",
    description: "우즈베크어와 카자흐어, 버마어의 성장",
    prompt:
      "2026년 오픈AI 자료에서 ChatGPT 활성 사용자 비중이 가장 빠르게 증가한 언어는 우즈베크어, 카자흐어, 버마어였습니다.",
    targetSeconds: 38,
    tags: ["2026", "AI", "언어"],
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
