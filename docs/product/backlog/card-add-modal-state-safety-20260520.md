# 카드 추가 모달 상태 보존/닫기 확인 안정화 백로그 (2026-05-20)

## 배경

카드 추가 모달에는 두 가지 상태 정합성 문제가 있다.

1. 직접 작성 탭에서 질문/답변을 작성한 뒤 `일괄 추가` 탭으로 전환하면 직접 작성 폼이 unmount되면서 입력 상태가 사라질 수 있다.
2. 작성 중인 카드 내용이 없는데도 `작성 중인 카드 내용이 있습니다...` 닫기 확인이 뜰 수 있다.

두 문제의 공통 원인은 탭/폼/dirty 상태의 source of truth가 불안정하다는 점이다. 탭 전환은 보기 전환이어야 하고, 닫기 확인은 실제로 저장되지 않은 의미 있는 입력값이 있을 때만 떠야 한다.

## 실행 원칙

- 이번 작업은 1인 개발 흐름으로 한 번에 묶어서 처리한다.
- 중간에 PR을 쪼개거나 바로 merge하지 않는다.
- 모든 상태 보존/닫기 확인/검증이 끝난 뒤 한 번에 PR을 올린다.
- 커밋은 가능하지만 PR/merge는 전체 구현과 검증 후 진행한다.

## 실행 체크리스트

- [x] 1. 직접 작성 폼과 일괄 추가 폼을 탭 전환 시 unmount하지 않고 유지한다.
- [x] 2. 비활성 탭은 `hidden`/`aria-hidden` 등 표시 상태만 바꾸고 React state는 보존한다.
- [x] 3. `manualDirty`와 `bulkDirty`를 분리한다.
- [x] 4. 닫기 확인의 source of truth를 `manualDirty || bulkDirty`로 둔다.
- [x] 5. 직접 작성 dirty는 raw HTML 문자열 비교가 아니라 의미 있는 카드 내용 존재 여부 기준으로 판단한다.
- [x] 6. 빈 paragraph, 빈 list, 빈 formatting-only HTML, 공백만 있는 값은 dirty로 보지 않는다.
- [x] 7. 이미지가 있으면 visible text가 없어도 dirty로 본다.
- [x] 8. localStorage draft 로딩 전/후 dirty가 잘못 true로 튀지 않게 한다.
- [x] 9. 직접 작성 저장/이미지 업로드 pending 중에는 현재 탭과 무관하게 닫기를 차단한다.
- [x] 10. 직접 작성 탭 → 일괄 추가 탭 → 직접 작성 탭 순서에서 질문/답변 입력이 유지되는지 확인한다.
- [x] 11. 빈 직접 작성 상태에서 닫기 버튼/overlay/Escape를 눌러도 confirm이 뜨지 않는지 확인한다.
- [x] 12. 일괄 추가에 텍스트가 있으면 직접 작성 탭에 있어도 닫기 confirm이 뜨는지 확인한다.
- [x] 13. `pnpm --filter @yeon/web lint`를 통과한다.
- [x] 14. `pnpm --filter @yeon/web typecheck`를 통과한다.
- [x] 15. `git diff --check`를 통과한다.
- [x] 16. 가능하면 localhost에서 탭 전환/닫기 확인 visual QA를 수행한다.
- [x] 17. 전체 작업을 한 커밋 또는 의미 있는 커밋 묶음으로 정리한다.
- [x] 18. 모든 개발이 끝난 뒤 한 번에 PR(main)을 올린다.
- [x] 19. compact editor 별도 header row를 제거하고 label/status를 toolbar row에 넣는다.
- [x] 20. toolbar row 왼쪽에는 `카드 질문`/`카드 답변` label을 표시한다.
- [x] 21. toolbar row 오른쪽에는 `이미지 삽입 가능`/`업로드 중` pill을 표시한다.
- [x] 22. 우측 preview rail의 `실시간 미리보기 / 앞면·뒷면` header row를 제거한다.
- [x] 23. `카드 답변 / 본문` 문구를 `카드 답변`으로 통일한다.

## 1차: 탭 전환 상태 보존

### 작업내용

- `AddCardsPanel`에서 직접 작성/일괄 추가 폼을 조건부 mount/unmount하지 않는다.
- 두 폼을 모두 mount한 뒤, 현재 mode에 따라 화면 표시만 전환한다.
- 비활성 탭 영역에는 `hidden`과 `aria-hidden`을 적용해 접근성/포커스 혼선을 줄인다.

### 논의 필요

- 비활성 폼의 submit 버튼/입력 포커스가 브라우저에서 접근되지 않도록 `hidden` 기반으로 숨기는 것이 맞다.

### 선택지

1. 탭 전환 시 localStorage draft 복원에 의존
   - 입력 중 손실 방어가 약하다.
2. 항상 mount + hidden 전환
   - React state를 그대로 보존하므로 가장 직접적이다.
3. 모든 입력 state를 부모로 끌어올림
   - 안정적이지만 변경 범위가 크다.

### 추천

2번. 탭 전환은 표시 상태이므로 컴포넌트 생명주기를 끊지 않는 것이 맞다.

### 사용자 방향

추천 기준으로 진행한다.

## 2차: 닫기 confirm 정확도 수정

### 작업내용

- 현재 직접 작성 dirty는 `snapshotValue(currentValue) !== snapshotValue(initialSnapshot)`라서 빈 rich HTML 구조도 dirty로 볼 수 있다.
- 직접 작성 dirty 기준을 `hasAnyDraftContent(currentValue)` 계열 의미 있는 내용 존재 여부로 바꾼다.
- `isDraftLoaded` 전에는 부모 dirty를 true로 올리지 않는다.
- bulk dirty는 기존처럼 `rawText.trim().length > 0` 기준을 유지한다.
- parent dirty는 `manualDirty || bulkDirty`로만 계산한다.

### 논의 필요

- formatting-only 입력을 dirty로 볼지 여부가 필요하다. 이번 요구 기준에서는 “작성 중인 카드 내용 없음”이면 confirm이 뜨면 안 되므로 formatting-only는 dirty가 아니다.

### 선택지

1. raw HTML snapshot 비교 유지
   - 빈 ProseMirror HTML에도 오탐 가능성이 있다.
2. 의미 있는 내용 기준으로 dirty 판단
   - 실제 사용자 입력 기준에 맞다.
3. 모든 editor transaction을 dirty로 판단
   - 내용이 없어도 confirm이 떠서 현재 문제를 해결하지 못한다.

### 추천

2번. 닫기 confirm은 실제 저장되지 않은 의미 있는 콘텐츠가 있을 때만 떠야 한다.

### 사용자 방향

추천 기준으로 진행한다.

## 3차: toolbar/header 공간 압축 추가 요구

### 작업내용

- compact editor의 별도 header row를 제거한다.
- `카드 질문`/`카드 답변` label은 toolbar row의 가장 왼쪽에 넣는다.
- `이미지 삽입 가능`/`업로드 중` 상태 pill은 toolbar row의 가장 오른쪽에 넣는다.
- toolbar 중앙에는 기존 편집 버튼들을 배치한다.
- 우측 preview rail 상단의 `실시간 미리보기 / 앞면·뒷면` header row를 제거한다.
- preview 내부 제목도 `카드 답변 / 본문` 대신 `카드 답변`으로 통일한다.
- 직접 작성 editor label도 `카드 답변 / 본문` 대신 `카드 답변`으로 바꾼다.

### 논의 필요

- toolbar row에 label/status를 넣으면 작은 폭에서 버튼 줄바꿈이 발생할 수 있으므로, label/status는 shrink/flex 기준을 명확히 해야 한다.
- status pill이 버튼 영역을 밀어내지 않게 오른쪽 끝에 두되, 좁은 화면에서는 wrap되어도 입력 영역을 가리지 않아야 한다.

### 선택지

1. 별도 header row 유지
   - 안정적이지만 사용자가 지적한 공간 낭비가 그대로 남는다.
2. label/status를 toolbar row에 합치기
   - 세로 공간을 줄이고 사용자의 요구와 일치한다.
3. label/status를 완전히 숨기기
   - 가장 압축되지만 현재 어느 editor인지 식별성이 떨어진다.

### 추천

2번. label과 상태는 필요하지만 별도 row로 둘 이유는 없으므로 toolbar row의 좌/우 끝으로 흡수한다.

### 사용자 방향

추천 기준으로 진행한다. 핵심은 `별도 header row 제거`, `label 좌측`, `이미지 상태 우측`, `카드 답변 / 본문 → 카드 답변`이다.

## 검증 기록

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `localhost:3000` Playwright QA는 시도했으나 현재 로컬 서버가 떠 있지 않아 `ERR_CONNECTION_REFUSED`로 실행 불가했다.

## 완료 기준

- 직접 작성에서 긴 질문/답변을 입력한 뒤 일괄 추가 탭을 눌렀다가 돌아와도 입력이 그대로 남아 있다.
- 직접 작성/일괄 추가 중 어느 탭에 있든 저장되지 않은 의미 있는 입력이 있으면 닫기 confirm이 뜬다.
- 아무 의미 있는 입력도 없으면 닫기 confirm이 뜨지 않는다.
- 빈 paragraph/list/formatting-only 상태는 dirty가 아니다.
- 이미지 삽입 상태는 dirty다.
- 검증 명령 3종을 통과한다.
- 모든 개발 완료 후 한 번에 PR을 올린다.
