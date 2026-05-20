# 카드 에디터 Tab 들여쓰기 동작 수정 백로그 (2026-05-20)

## 배경

카드 추가 화면의 질문/답변 rich markdown editor에서 `Tab` 키를 눌렀을 때 아무 동작이 없거나 포커스 이동처럼 보인다. 사용자가 기대하는 동작은 에디터 안에서 4칸 들여쓰기가 입력되는 것이다.

## 1차: Tab 키 에디터 입력 계약 복구

### 작업내용

- `CardRichMarkdownEditor`의 keyboard shortcut / keydown 처리 구조를 확인한다.
- `Tab` 입력 시 브라우저 기본 포커스 이동을 막고 에디터 본문에 4칸 공백을 삽입한다.
- `Shift+Tab`은 기존 접근성/역방향 포커스 요구가 없으므로 우선 기본 동작을 유지할지, 같은 방식으로 처리할지 코드 맥락을 확인한다.
- 질문/답변 양쪽 editor와 카드 row inline editor에서도 동일하게 동작하게 한다.

### 논의 필요

- 목록 안에서 `Tab`을 목록 depth 변경으로 쓸지, 항상 4칸 공백으로 쓸지 선택이 필요하다. 사용자 지시는 명확히 “4칸 띄워져야지”이므로 이번 수정은 항상 4칸 공백 삽입으로 고정한다.

### 선택지

1. TipTap extension keyboard shortcut으로 `Tab`을 처리한다.
   - 에디터 계약에 가깝고 모든 사용처에 재사용된다.
2. contenteditable DOM `onKeyDown`에서 직접 처리한다.
   - 빠르지만 React/Tiptap 이벤트 경계가 분산될 수 있다.
3. toolbar 버튼을 추가한다.
   - 키보드 요구를 해결하지 못한다.

### 추천

1번을 우선한다. 이미 `CardRichMarkdownEditor`가 공용 editor이므로 shortcut을 editor 레벨에 두는 것이 재발 방지에 맞다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- 카드 추가 질문 editor에서 `Tab`을 누르면 공백 4칸이 삽입된다.
- 카드 추가 답변 editor에서도 동일하게 동작한다.
- 포커스가 모달 내 다음 버튼으로 빠지지 않는다.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- 가능하면 `localhost:3001` Playwright로 Tab 입력을 확인한다.
