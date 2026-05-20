# 카드 에디터 업로드 상태 루프 회귀 수정 백로그 (2026-05-20)

## 배경

카드 추가 모달을 `localhost:3001`에서 Playwright로 확인하던 중 브라우저 콘솔에 `Maximum update depth exceeded`가 반복 출력됐다. 스택은 `CardRichMarkdownEditor.useEffect`의 `onUploadingChange(isUploading)` 호출과 부모의 `setUploadingSides` 갱신으로 이어진다.

정상 흐름은 다음이어야 한다.

1. 카드 추가 모달을 연다.
2. 질문/답변 editor가 현재 업로드 상태를 부모에게 1회 동기화한다.
3. 이미지 업로드 시작/종료 때만 부모 uploading state가 바뀐다.
4. 단순 렌더나 inline callback 재생성만으로는 부모 state update가 반복되지 않는다.

## 1차: 업로드 상태 콜백 루프 차단

### 작업내용

- `CardRichMarkdownEditor`에서 `onUploadingChange` callback identity 변화만으로 effect가 재실행되지 않게 한다.
- 최신 callback은 ref에 보관하고, 실제 업로드 상태 값이 바뀔 때만 부모에게 알린다.
- 부모 `AddCardForm`의 `setUploadingSides`도 동일 값이면 기존 state를 반환해 방어한다.
- 동일 패턴을 쓰는 카드 row 편집 경로에서도 같은 방어가 필요한지 확인한다.

### 논의 필요

- 업로드 상태 초기값 false를 부모에게 한 번 전달할 필요가 있는지 확인이 필요하다. 이번 문제에서는 false 반복 전달이 루프 원인이므로, 상태 변화 중심으로 제한한다.

### 선택지

1. 부모 inline callback을 모두 `useCallback`으로 감싼다.
   - 증상은 줄지만 다른 부모에서 같은 문제가 재발할 수 있다.
2. 자식 editor에서 callback ref를 사용하고 `isUploading` 변화에만 알린다.
   - source of truth인 업로드 상태 변화에 맞고 재사용 컴포넌트가 안전해진다.
3. 부모 setState만 동일값 guard로 막는다.
   - 방어는 되지만 effect가 렌더마다 호출되는 구조는 남는다.

### 추천

2번을 기본으로 하고, 부모 동일값 guard를 보조로 추가한다. editor 컴포넌트의 상태 알림 계약을 안정화하면서 부모 state도 오염되지 않게 한다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 카드 추가 모달을 열어도 `Maximum update depth exceeded`가 반복 출력되지 않는다.
- 질문/답변 입력 시 저장 버튼 활성화가 유지된다.
- 직접 작성/일괄 추가 탭 전환 후 작성 내용이 유지된다.
- 닫기 confirm은 의미 있는 입력이 있을 때만 뜬다.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- 관련 테스트 또는 최소한 targeted Playwright 확인을 수행한다.

## 진행 메모

- `CardRichMarkdownEditor`의 업로드 상태 알림 effect를 callback identity가 아니라 `isUploading` 변화에만 반응하도록 조정한다.
- `AddCardForm`, `CardRow` 부모 state 갱신은 동일 업로드 상태면 기존 객체를 반환해 방어한다.
- `localhost:3001` dev server는 `/home/osuma/coding_stuffs/yeon`에서 실행 중이므로, 브라우저 회귀 확인은 PR merge 후 `yeon` main 동기화 상태에서 수행한다.
