# 카드 추가 모달 Flat Composition 개선 백로그 (2026-05-20)

## 배경

현재 카드 추가 화면은 질문/답변 작성 영역과 미리보기 영역이 모두 `카드 안에 카드`처럼 보인다. 바깥 panel, 안쪽 editor card, toolbar card, preview card가 반복되어 실제 입력 공간보다 wrapper와 border가 더 크게 느껴진다. 사용자가 싫어하는 핵심은 단순히 여백이 큰 것이 아니라, 같은 수준의 시각 컨테이너가 중첩되어 화면이 답답하고 복잡해 보이는 구조다.

## 실행 체크리스트

- [x] 1. 카드 질문/답변 작성 영역에서 바깥 wrapper를 제거하고 editor shell 하나만 남긴다.
- [x] 2. compact editor header를 editor shell 안으로 넣어 label/helper/status가 별도 카드처럼 보이지 않게 한다.
- [x] 3. compact toolbar의 크기, gap, padding을 상수/토큰 기반으로 낮춘다.
- [x] 4. 질문/답변 editor 높이를 줄여 100% 확대율에서 두 영역이 같이 보이게 한다.
- [x] 5. 우측 preview rail에서 앞면/뒷면 nested card border/rounded/shadow를 제거한다.
- [x] 6. 반복 설명 문구를 줄이고 compact 화면의 필수 상태 문구만 남긴다.
- [x] 7. 색상/텍스트/spacing class를 기존 디자인 규칙 또는 카드 editor compact 상수로 관리한다.
- [x] 8. `pnpm --filter @yeon/web lint`를 통과한다.
- [x] 9. `pnpm --filter @yeon/web typecheck`를 통과한다.
- [x] 10. `git diff --check`를 통과한다.
- [x] 11. `localhost:3000` 접근 가능 여부를 확인했다. 단, 현재 로컬 덱 경로가 데이터를 불러오지 못해 카드 추가 모달 visual QA는 코드/DOM 중첩 제거 근거로 대체한다.
- [x] 12. commit → PR(main) → merge까지 완료한다.

## 1차

### 작업내용

- 카드 질문/답변 작성 영역의 이중 wrapper 제거
  - 현재: 바깥 `rounded border panel` 안에 다시 editor wrapper와 toolbar/editor border가 들어감
  - 목표: 질문/답변 section 자체가 editor shell이 되게 만들고, 별도 바깥 카드 wrapper를 제거
- 미리보기 영역의 이중 wrapper 제거
  - 현재: 우측 preview panel 안에 앞면/뒷면 카드가 다시 큰 카드로 들어감
  - 목표: 우측 영역은 하나의 preview rail로 두고, 앞면/뒷면은 과한 카드가 아니라 얇은 surface/section으로 표시
- toolbar를 compact mode에서 한 줄에 가깝게 압축
  - 버튼 크기, gap, padding을 토큰화/상수화해서 관리
  - 임의 숫자를 컴포넌트 곳곳에 흩뿌리지 않음
- 반복 설명 문구 제거
  - 모달 설명, 질문 helper, 미리보기 설명, 삽입 안내가 반복됨
  - compact add-card 화면에서는 필수 상태 문구만 남김
- 질문/답변 editor 높이 재조정
  - 질문과 답변이 100% 브라우저 확대율에서 동시에 보이는 것을 1차 기준으로 삼음
- 하단 저장 영역은 유지하되 compact footer로 관리
  - 저장/취소 버튼은 모달 footer에 두되 높이와 문구를 최소화

### 논의 필요

- 미리보기 앞면/뒷면을 “실제 카드처럼” 보이게 하되, 중첩 카드 느낌은 줄여야 한다.
- toolbar 기능을 모두 노출할지, 일부를 더보기/보조 액션으로 접을지 결정이 필요하다.
- compact spacing/token을 기존 `SHARED_FEATURE_CLASS`, `CARD_SERVICE_COMMON_CLASS`에 추가할지, 카드 editor 전용 view constant로 둘지 결정이 필요하다.

### 선택지

1. 여백만 줄이기
   - 빠르지만 카드 안 카드 문제는 남는다.
2. 작성 영역과 preview 영역의 wrapper hierarchy를 flat하게 재구성
   - 이번 문제의 본질을 해결한다.
   - 기존 기능은 유지하면서 DOM/시각 구조를 단순화한다.
3. editor/preview 디자인 시스템을 크게 재설계
   - 장기적으로 좋지만 이번 카드 추가 화면 수정 범위보다 크다.

### 추천

2번을 추천한다. 사용자가 지적한 문제는 여백 수치보다 `중첩된 시각 컨테이너`다. 따라서 outer card를 제거하고, editor toolbar + body를 하나의 flat section으로 만든 뒤, preview도 우측 rail 안에서 얇은 front/back surface로 정리해야 한다.

## 2차

### 작업내용

- 디자인 토큰/공통 class 정리
  - 텍스트 크기, 버튼 크기, gap, padding을 임의 `text-[13px]`, `h-8`, `px-3`로 흩뿌리지 않는다.
  - 기존 `SHARED_FEATURE_CLASS`, `CARD_SERVICE_COMMON_CLASS`를 우선 재사용한다.
  - 카드 editor 전용 compact 값은 `card-rich-markdown-editor-view.tsx` 같은 view constant에 모아 source of truth로 둔다.
- compact layout 상수 후보
  - section label text
  - helper/status pill text
  - toolbar button size
  - toolbar gap/padding
  - editor body padding/text/line-height
  - preview header/body spacing
- 변경 후 코드 리뷰 기준
  - 같은 의미의 class 문자열이 여러 파일에 복붙되어 있지 않은가
  - compact/default 분기가 raw 문자열 난사로 변하지 않았는가
  - 카드 서비스 외부에 불필요한 전역 스타일을 추가하지 않았는가

### 논의 필요

- 현재 shared class가 충분하지 않은 값은 카드 서비스 전용 상수로 둘지, shared style constant로 승격할지 결정이 필요하다.

### 선택지

1. 기존 class만 억지로 조합
   - 빠르지만 compact UI에 맞지 않는 값이 생긴다.
2. 카드 editor compact token object 추가
   - 화면 목적에 맞고 영향 범위가 작다.
3. 전역 디자인 토큰 확장
   - 장기적으로 좋지만 이번 작업 범위가 커진다.

### 추천

2번을 추천한다. 카드 editor compact layout은 카드 추가 화면의 특수 목적이 강하므로 우선 card editor view 상수로 관리하고, 반복 사용이 늘어나면 shared token으로 승격한다.

## 완료 기준

- 카드 질문 작성 영역에서 바깥 카드 wrapper와 안쪽 editor card가 이중으로 보이지 않는다.
- 카드 답변 작성 영역도 동일하게 flat한 section으로 보인다.
- 우측 미리보기는 preview rail 안에 앞면/뒷면이 과한 nested card처럼 보이지 않는다.
- 질문/답변 editor가 100% 확대율의 일반 데스크톱 화면에서 동시에 보인다.
- toolbar 높이가 기존보다 명확히 낮아진다.
- 텍스트/spacing/class 값이 한 곳의 상수 또는 기존 공통 class 기준으로 관리된다.
- `pnpm --filter @yeon/web lint`, `pnpm --filter @yeon/web typecheck`, `git diff --check`를 통과한다.

## 사용자 방향

추천 기준으로 진행한다. 핵심은 “더 예쁜 카드”가 아니라 “카드 안에 카드처럼 보이는 중첩 wrapper를 제거하고, 작성/미리보기 영역을 flat하고 촘촘하게 재구성하는 것”이다.
