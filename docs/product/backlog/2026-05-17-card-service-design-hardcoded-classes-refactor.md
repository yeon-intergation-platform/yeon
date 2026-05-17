# Backlog: 카드서비스 홈/프로필 디자인 하드코딩 상수화

## 차수 1

- 작업내용: 카드서비스 홈 화면(`card-service-home`)과 프로필 카드(`typing-profile-card`)에서
  화면 레이아웃/토큰 성격의 Tailwind 클래스 문자열을 상수화해 변경 지점을 단일화한다.
- 논의 필요: 없음
- 선택지:
  - (1) JSX에서 기존 문자열 유지
  - (2) 파일 내 const 객체로 정리
  - (3) 피처 단위 상수 모듈로 분리
- 추천: (3) 피처 단위 상수 모듈 분리(`.constant`/`.const`)
- 사용자 방향: 추천

## 차수 2

- 작업내용: 상수 모듈 기준으로 렌더링 코드를 치환하고 동작 회귀 없이 타입/린트 통과를 확인한다.
- 논의 필요: 없음
- 선택지: (1) 최소 치환(클래스만), (2) 상수화 + 주석 보강
- 추천: (1) 최소 치환 우선
- 사용자 방향: 추천

## 차수 3 (2차 캠페인: 숨은 후보 1차 선별)

- 작업내용:
  - `apps/web/src/features/card-service`와 `apps/web/src/features/typing-service` 대상 `className="..."` 직접 하드코딩을 전체 스캔해 반복 패턴/의미 패턴을 우선순위화한다.
  - 반복 다중 카운트 기준으로 상수화 후보를 선별하고, 1회차로 1~2개 파일씩 점진 반영한다.
- 논의 필요: 낮음(반복성 기준 우선)
- 선택지:
  - (1) 반복 빈도 3건 이상만 반영
  - (2) 2건 이상 + 의미 일치군(버튼/패널/입력)도 함께 반영
  - (3) UI/도메인 경계까지 확장해 전면 재정의
- 추천: (2) 반복 2건 이상 + 의미군 동치 우선
- 사용자 방향: 추천

### 1차 선별 후보(상위 30: 대상: card-service / typing-service)

1. `text-[14px] font-semibold text-[#111]` (6건)
2. `text-[20px] font-bold` (6건)
3. `text-[16px] text-[#111]` (6건)
4. `flex flex-col gap-2` (8건)
5. `text-[13px] font-medium text-[#555]` (5건)
6. `text-[14px] text-[#888]` (5건)
7. `text-[14px] text-red-600` (5건)
8. `grid gap-3 sm:grid-cols-2` (4건)
9. `text-[13px] text-red-600` (4건)
10. `font-semibold text-[#111]` (4건)
11. `min-w-0` (4건)
12. `flex flex-wrap gap-2` (4건)
13. `flex items-center gap-2` (3건)
14. `flex items-center justify-between gap-3` (3건)
15. `flex items-start justify-between gap-3` (3건)
16. `font-mono text-[12px] text-[#aaa]` (3건)
17. `grid gap-2 text-[13px] font-semibold text-[#666]` (3건)
18. `h-12 rounded-xl border border-[#d9d9d9] px-4 text-[15px] font-semibold text-[#111] outline-none focus:border-[#111] disabled:cursor-not-allowed disabled:bg-[#f5f5f5]` (3건)
19. `mb-3 text-[14px] font-bold` (3건)
20. `rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-6 py-5 font-mono text-[19px] leading-[2] tracking-[0.01em]` (3건)
21. `mt-3 text-[14px] text-[#666]` (3건)
22. `mt-3 text-[13px] text-red-600` (3건)
23. `w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-5 py-4 font-mono text-[16px] leading-[1.7] text-[#111] outline-none transition-colors placeholder:text-[#ccc] focus:border-[#111] disabled:cursor-not-allowed disabled:opacity-40` (3건)
24. `mt-3 grid gap-3` (3건)
25. `text-[13px] font-semibold text-[#888]` (3건)
26. `border-b border-[#e5e5e5] px-6 py-3 md:px-12` (2건)
27. `grid gap-3 p-4 md:p-5` (2건)
28. `h-12 rounded-xl border border-[#e5e5e5] px-5 text-[14px] font-bold text-[#666] transition-colors hover:border-[#111] hover:text-[#111] disabled:cursor-not-allowed disabled:opacity-50` (2건)
29. `mt-5 grid gap-5` (2건)
30. `inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-3 py-1.5 text-[13px] font-bold text-[#111]` (2건)

## 차수 4 (2차 캠페인 라운드 1 반영)

- 작업내용: typing-service 중심의 반복 하드코딩 후보에서 중복도가 높은 패턴을 우선 반영.
  - `apps/web/src/features/typing-service/typing-service-common.const.ts`에 의미 기반 공통 토큰 추가.
  - `typing-deck-form.tsx`, `typing-deck-detail-panel.tsx`, `typing-deck-list.tsx`, `typing-deck-bulk-passage-import-form.tsx`에서 동일 의미 스타일을 상수로 치환.
- 논의 필요: 낮음(후보군은 반복 빈도 + 의미 일치 기준)
- 선택지:
  - (1) 2회 미만 패턴은 보류 후, 의미가 명확한 중복만 우선 반영
  - (2) 2회 미만 포함 즉시 전체 반영
- 추천: (1) 의미 일치 우선의 선별 반영
- 사용자 방향: 추천

## 차수 5 (2차 캠페인 라운드 1.5: 타이핑 핵심군 추가 반영)

- 작업내용:
  - `shared-style-constants.ts`에 `inlineItemsCenterGap2` 공통 클래스를 추가.
  - `typing-service-common.const.ts`에 타이핑 레이스/결과값 공통 토큰을 추가:
    - `metricValue`, `metricResultValue`, `raceStatRowBase`, `raceStatValueRow`,
      `raceInputArea`, `racePromptTextPanel`, `raceResultCard`.
  - `typing-race-solo-practice-panel.tsx`, `typing-race-solo-screen.tsx`,
    `typing-race-multiplayer-screen.tsx`, `character-frame-admin.tsx`,
    `typing-bgm-button.tsx`에서 동일 의미/반복 패턴을 상수로 치환.
- 논의 필요: 없음
- 선택지:
  - (1) 라운드당 1~2개 화면 우선 반영
  - (2) 카드/타이핑을 한 번에 모두 확장 반영
- 추천: (1) 라운드당 1~2개 화면 점진 반영 + 재스캔
- 사용자 방향: 추천
