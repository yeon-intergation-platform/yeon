import {
  TYPING_DECK_LANGUAGE_TAGS,
  TYPING_DECK_SOURCE,
  TYPING_DECK_VISIBILITY,
  TYPING_PASSAGE_DIFFICULTIES,
  TYPING_PASSAGE_TEXT_TYPES,
  type TypingDeckDto,
  type TypingDeckPassageDto,
} from "@yeon/api-contract/typing-decks";

export type DefaultTypingDeck = Omit<
  TypingDeckDto,
  "passageCount" | "isOwner" | "canEdit" | "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  passages: TypingDeckPassageDto[];
};

const STATIC_DEFAULT_CREATED_AT = "2026-05-01T00:00:00.000Z";

function defaultPassage(
  id: string,
  title: string,
  prompt: string,
  sortOrder: number,
  overrides: Partial<
    Pick<TypingDeckPassageDto, "textType" | "difficulty">
  > = {},
): TypingDeckPassageDto {
  return {
    id,
    title,
    prompt,
    textType: overrides.textType ?? TYPING_PASSAGE_TEXT_TYPES.short,
    difficulty: overrides.difficulty ?? TYPING_PASSAGE_DIFFICULTIES.normal,
    sortOrder,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
  };
}

const KOREAN_CONTEXTS = [
  {
    title: "아침 정리",
    body: "책상 위 메모를 한곳에 모으고 오늘 해야 할 일을 또렷한 순서로 적습니다",
  },
  {
    title: "도서관 오후",
    body: "조용한 자리에서 자료를 읽고 중요한 문장을 짧은 말로 다시 써 봅니다",
  },
  {
    title: "팀 회고",
    body: "서로의 시도를 차분히 듣고 다음 실험에 필요한 기준을 함께 고릅니다",
  },
  {
    title: "산책 기록",
    body: "느린 걸음으로 골목을 지나며 보이는 색과 소리를 마음속에 저장합니다",
  },
  {
    title: "주방 준비",
    body: "재료를 씻고 도구를 정돈하며 안전한 순서로 일을 시작합니다",
  },
  {
    title: "학습 계획",
    body: "어려운 단원을 작은 단위로 나누고 쉬운 문제부터 정확하게 풉니다",
  },
  {
    title: "여행 준비",
    body: "가방의 무게를 줄이고 꼭 필요한 물건만 목록으로 확인합니다",
  },
  {
    title: "고객 응대",
    body: "상대의 불편을 먼저 요약하고 해결 가능한 선택지를 분명하게 안내합니다",
  },
  {
    title: "저녁 점검",
    body: "오늘 남긴 기록을 다시 읽고 내일 이어 갈 한 가지 행동을 정합니다",
  },
  {
    title: "창작 시간",
    body: "떠오른 장면을 바로 붙잡고 불필요한 수식어를 덜어 담백하게 다듬습니다",
  },
] as const;

const KOREAN_FOCUS_LINES = [
  "쉼표가 보이면 손끝의 속도를 낮추고 문장 끝에서는 호흡을 고르게 유지하세요",
  "오타를 발견해도 당황하지 말고 다음 글자부터 다시 일정한 박자를 찾으세요",
  "받침이 많은 낱말은 자판 위치를 먼저 떠올린 뒤 부드럽게 이어서 입력하세요",
  "짧은 구절을 눈으로 미리 묶어 읽으면 손의 움직임이 훨씬 안정됩니다",
  "문장의 뜻을 이해하며 입력하면 낯선 표현도 더 오래 기억에 남습니다",
  "속도보다 균형을 우선하면 긴 문장에서도 리듬이 쉽게 무너지지 않습니다",
  "자주 틀리는 글자는 따로 의식하되 손목에는 과한 힘을 주지 마세요",
  "문단이 길어질수록 어깨를 낮추고 화면과 손 사이의 간격을 일정하게 두세요",
  "마지막 글자까지 확인하는 습관은 빠른 입력보다 더 오래 남는 실력입니다",
  "새 문장을 만날 때마다 처음 두 단어를 천천히 시작하면 전체 흐름이 편해집니다",
] as const;

const ENGLISH_CONTEXTS = [
  {
    title: "Morning notes",
    body: "clear the desk, group the scattered tasks, and choose the first useful action",
  },
  {
    title: "Library focus",
    body: "read a quiet paragraph, mark the essential idea, and rewrite it in plain words",
  },
  {
    title: "Team review",
    body: "listen for the reason behind each choice and turn the lesson into a small experiment",
  },
  {
    title: "Walking log",
    body: "notice the corners, weather, and passing sounds while keeping an easy pace",
  },
  {
    title: "Kitchen prep",
    body: "wash the tools, sort the ingredients, and begin with the safest step",
  },
  {
    title: "Study plan",
    body: "break the hard chapter into pieces and solve the simple examples with care",
  },
  {
    title: "Travel checklist",
    body: "pack only what matters and leave enough room for changes along the way",
  },
  {
    title: "Support reply",
    body: "summarize the concern first and offer clear options without rushing the reader",
  },
  {
    title: "Evening review",
    body: "read the notes from the day and choose one thread to continue tomorrow",
  },
  {
    title: "Creative draft",
    body: "capture the first image quickly and remove extra words until the sentence breathes",
  },
] as const;

const ENGLISH_FOCUS_LINES = [
  "When a comma appears, slow the fingers slightly and keep the ending of the sentence steady.",
  "If a mistake happens, return to a calm rhythm instead of chasing the lost second.",
  "Group short phrases with your eyes before your hands begin to move across the keys.",
  "Let the meaning guide the cadence so unfamiliar words become easier to remember.",
  "Accuracy builds confidence, and confidence makes speed arrive without being forced.",
  "Relax the shoulders during longer lines and keep the screen at a comfortable distance.",
  "Watch repeated letters carefully, but avoid pressing the keys harder than necessary.",
  "Start each new passage slowly for two words, then allow the natural pace to grow.",
  "Finish the final character with attention, because strong endings protect the whole run.",
  "Read one word ahead whenever possible and let the fingers follow a prepared path.",
] as const;

function generatedPassageDifficulty(index: number) {
  if (index % 10 === 0 || index % 10 === 1) {
    return TYPING_PASSAGE_DIFFICULTIES.easy;
  }
  if (index % 10 === 8 || index % 10 === 9) {
    return TYPING_PASSAGE_DIFFICULTIES.hard;
  }
  return TYPING_PASSAGE_DIFFICULTIES.normal;
}

function generatedPassageTextType(index: number) {
  return index % 5 === 4
    ? TYPING_PASSAGE_TEXT_TYPES.long
    : TYPING_PASSAGE_TEXT_TYPES.short;
}

function buildKoreanPassages() {
  return KOREAN_CONTEXTS.flatMap((context, contextIndex) =>
    KOREAN_FOCUS_LINES.map((focus, focusIndex) => {
      const sortOrder = contextIndex * KOREAN_FOCUS_LINES.length + focusIndex;
      return defaultPassage(
        `default-ko-daily-rhythm-${String(sortOrder + 1).padStart(3, "0")}`,
        `${context.title} ${String(focusIndex + 1).padStart(2, "0")}`,
        `${context.title} 시간에는 ${context.body}. ${focus}`,
        sortOrder,
        {
          difficulty: generatedPassageDifficulty(sortOrder),
          textType: generatedPassageTextType(sortOrder),
        },
      );
    }),
  );
}

function buildEnglishPassages() {
  return ENGLISH_CONTEXTS.flatMap((context, contextIndex) =>
    ENGLISH_FOCUS_LINES.map((focus, focusIndex) => {
      const sortOrder = contextIndex * ENGLISH_FOCUS_LINES.length + focusIndex;
      return defaultPassage(
        `default-en-flow-basics-${String(sortOrder + 1).padStart(3, "0")}`,
        `${context.title} ${String(focusIndex + 1).padStart(2, "0")}`,
        `${context.title}: ${context.body}. ${focus}`,
        sortOrder,
        {
          difficulty: generatedPassageDifficulty(sortOrder),
          textType: generatedPassageTextType(sortOrder),
        },
      );
    }),
  );
}

export const DEFAULT_TYPING_DECKS: readonly DefaultTypingDeck[] = [
  {
    id: "default-ko-daily-rhythm",
    title: "한국어 기본 리듬",
    description:
      "짧은 문장과 자연스러운 호흡으로 정확도와 속도를 함께 기르는 기본 한국어 덱입니다.",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.ko,
    visibility: TYPING_DECK_VISIBILITY.public,
    source: TYPING_DECK_SOURCE.default,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
    passages: buildKoreanPassages(),
  },
  {
    id: "default-en-flow-basics",
    title: "English Flow Basics",
    description:
      "A default English deck for steady rhythm, word grouping, and comfortable typing flow.",
    languageTag: TYPING_DECK_LANGUAGE_TAGS.en,
    visibility: TYPING_DECK_VISIBILITY.public,
    source: TYPING_DECK_SOURCE.default,
    createdAt: STATIC_DEFAULT_CREATED_AT,
    updatedAt: STATIC_DEFAULT_CREATED_AT,
    passages: buildEnglishPassages(),
  },
];
