"use client";
import {
  YeonIcon,
  YeonImage,
  YeonLink,
  YeonSurface,
  YeonText,
  YeonView,
} from "@yeon/ui";
import { TypingServiceHeader } from "./typing-service-header";
import { TYPING_SERVICE_HOME_CLASS as C } from "./typing-service-home.const";

// 백지 학습(recall) 서비스 홈 목업.
// 실제 타자 홈과 동일한 셸/레이아웃 상수/프리미티브를 재사용해 시각적 정합을 맞춘 목이며,
// 데이터는 정적 mock. 실제 승격 시 이 구조에 훅/쿼리만 연결한다.
const BAEKJI_MOCK = {
  todayCount: 18,
  streakDays: 7,
  steps: [
    {
      n: "STEP 1",
      title: "보고 쓰기",
      desc: "원문을 보며 그대로 따라 쳐서 익혀요",
    },
    {
      n: "STEP 2",
      title: "가리고 쓰기",
      desc: "일부를 빈칸으로 가리고 전체를 써요",
    },
    {
      n: "STEP 3",
      title: "안 보고 쓰기",
      desc: "아무것도 안 보고 기억으로 전부 써내요",
    },
  ],
  decks: [
    {
      label: "영어 회화 문장",
      desc: "축자 채점 · 42문장",
      due: "12장",
      done: false,
    },
    {
      label: "알고리즘 스니펫",
      desc: "축자(코드) · 15문장",
      due: "6장",
      done: false,
    },
    {
      label: "좋아하는 문장",
      desc: "축자 채점 · 20문장",
      due: "복습 완료",
      done: true,
    },
  ],
} as const;

type DeckRowProps = {
  label: string;
  desc: string;
  due: string;
  done: boolean;
};

function DeckRow({ label, desc, due, done }: DeckRowProps) {
  return (
    <YeonView as="span" className={C.featureRow}>
      <YeonView as="span" aria-hidden="true" className={C.featureIconWrap}>
        <YeonImage
          src="/typing/practice-deck-icon.svg"
          alt=""
          aria-hidden="true"
          className={C.featureIcon}
        />
      </YeonView>
      <YeonView as="span" className={C.featureBody}>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={C.featureTitle}
        >
          {label}
        </YeonText>
        <YeonText
          as="span"
          variant="unstyled"
          tone="inherit"
          className={C.featureDescription}
        >
          {desc}
        </YeonText>
      </YeonView>
      <YeonText
        as="span"
        variant="unstyled"
        tone="inherit"
        className={
          done
            ? "shrink-0 rounded-full border border-[#e5e5e5] px-2.5 py-1 text-[12px] text-[#aaa]"
            : "shrink-0 rounded-full border border-[#111] px-2.5 py-1 text-[12px] font-bold text-[#111]"
        }
      >
        {due}
      </YeonText>
    </YeonView>
  );
}

export function BaekjiMockHome() {
  return (
    <YeonView className={C.root}>
      <TypingServiceHeader active="home" title="백지" />

      <YeonView as="main" className={C.main}>
        <YeonView as="section" className={C.introSection}>
          <YeonView className={C.introCopy}>
            <YeonText
              as="h1"
              variant="unstyled"
              tone="inherit"
              className={C.introTitle}
            >
              안 보고 써서 외우는, 백지
            </YeonText>
            <YeonText
              as="p"
              variant="unstyled"
              tone="inherit"
              className={C.introDescription}
            >
              안 보고 쓸 수 있으면, 진짜 아는 것. 보고 쓰기 → 가리고 쓰기 → 안
              보고 쓰기 3단계로 문장을 머릿속에 새깁니다.
            </YeonText>
          </YeonView>
        </YeonView>

        <YeonSurface as="section" className={C.boardSection}>
          {/* 좌: 오늘의 백지 요약 + 3단계 */}
          <YeonView className={C.profilePanel}>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={C.sectionTitle}
            >
              오늘의 백지
            </YeonText>
            <YeonView className="mt-5 flex items-center gap-5 rounded-[20px] border border-[#111] p-5">
              <YeonText
                as="span"
                variant="unstyled"
                tone="inherit"
                className="text-[44px] font-black leading-none tracking-[-0.03em] text-[#111]"
              >
                {BAEKJI_MOCK.todayCount}
              </YeonText>
              <YeonView className="min-w-0">
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="block text-[15px] font-bold text-[#111]"
                >
                  오늘 쓸 카드
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="mt-1 block text-[12px] text-[#666]"
                >
                  복습 예정 우선 · 연속 {BAEKJI_MOCK.streakDays}일
                </YeonText>
              </YeonView>
            </YeonView>

            <YeonView className="mt-4 grid gap-3">
              {BAEKJI_MOCK.steps.map((step) => (
                <YeonView
                  key={step.n}
                  className="rounded-2xl border border-[#e5e5e5] bg-white px-4 py-3.5"
                >
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="text-[11px] font-extrabold tracking-[0.06em] text-[#aaa]"
                  >
                    {step.n}
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 block text-[15px] font-bold text-[#111]"
                  >
                    {step.title}
                  </YeonText>
                  <YeonText
                    as="span"
                    variant="unstyled"
                    tone="inherit"
                    className="mt-1 block text-[13px] leading-[1.5] text-[#666]"
                  >
                    {step.desc}
                  </YeonText>
                </YeonView>
              ))}
            </YeonView>
          </YeonView>

          {/* 우: 바로 시작 CTA + 덱 목록 */}
          <YeonView className={C.actionPanel}>
            <YeonText
              as="h2"
              variant="unstyled"
              tone="inherit"
              className={C.sectionTitle}
            >
              바로 시작
            </YeonText>

            <YeonLink
              href="/recall-service/session"
              aria-label="백지 복습 시작 — 오늘 쓸 카드를 안 보고 써봐요"
              className="group mt-5 flex items-center gap-4 rounded-[20px] bg-[#111] px-6 py-6 text-white no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <YeonView
                as="span"
                className="flex min-w-0 flex-1 flex-col gap-1"
              >
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[19px] font-black tracking-[-0.02em] text-white"
                >
                  백지 복습 시작
                </YeonText>
                <YeonText
                  as="span"
                  variant="unstyled"
                  tone="inherit"
                  className="text-[13px] text-[#bbb]"
                >
                  오늘 쓸 카드를 안 보고 써봐요
                </YeonText>
              </YeonView>
              <YeonIcon
                name="chevron-right"
                size={22}
                aria-hidden="true"
                className="shrink-0 text-white"
              />
            </YeonLink>

            <YeonView aria-hidden="true" className={C.featureDivider} />

            <YeonText
              as="h3"
              variant="unstyled"
              tone="inherit"
              className={C.featureListTitle}
            >
              백지로 외울 덱
            </YeonText>

            <YeonView className={C.featureList}>
              {BAEKJI_MOCK.decks.map((deck) => (
                <DeckRow
                  key={deck.label}
                  label={deck.label}
                  desc={deck.desc}
                  due={deck.due}
                  done={deck.done}
                />
              ))}
            </YeonView>
          </YeonView>
        </YeonSurface>
      </YeonView>
    </YeonView>
  );
}
