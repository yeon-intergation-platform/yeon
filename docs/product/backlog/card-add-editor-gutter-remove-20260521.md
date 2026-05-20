# 카드 추가 에디터 왼쪽 gutter 제거 백로그 (2026-05-21)

## 배경

카드 추가 compact editor body가 `grid-cols-[88px_minmax(0,1fr)]`로 나뉘어 실제 입력 영역 앞에 비어 있는 왼쪽 gutter를 만든다. 사용자는 입력 내용이 editor body의 왼쪽부터 바로 보여야 한다고 명시했다.

## 1차

### 작업내용

- compact editor body의 2열 grid/gutter 구조를 제거한다.
- `EditorContent`가 editor shell 본문 전체 폭을 사용하도록 한다.
- toolbar label 정렬은 유지하되 본문 입력 시작 위치는 왼쪽 padding 기준으로 이동한다.

### 논의 필요

- 없음. 왼쪽 gutter 제거가 명시됐다.

### 선택지

1. gutter 폭만 줄인다.
   - 비어 있는 영역이 계속 남는다.
2. body gutter/grid를 제거한다.
   - 요구와 정확히 맞다.
3. toolbar까지 전부 재배치한다.
   - 현재 요구보다 과하다.

### 추천

2번. 본문은 label grid와 분리하고 입력 내용은 editor body 왼쪽에서 시작해야 한다.

### 사용자 방향

추천 기준으로 진행한다.

## 완료 기준

- compact editor body에 `grid-cols-[88px_minmax(0,1fr)]`가 남지 않는다.
- `editorBodyGutter` 렌더링이 제거된다.
- 카드 질문/답변 입력 내용이 본문 왼쪽 padding부터 시작한다.
- web lint/typecheck/build를 통과한다.
