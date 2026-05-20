# 카드 에디터 WYSIWYG 편집 + Markdown 복사 전환 (2026-05-21)

## 1차 — 기준 상태와 작업 경계 고정

### 작업내용

- 카드 서비스 TipTap 에디터의 목록, 테이블, 이미지, 복사/붙여넣기, asset upload 경로를 현재 코드 기준으로 고정한다.
- Next.js는 업로드 프록시/BFF만 담당하고, 저장·권한·asset 소유권은 Spring/R2 경로를 유지한다.

### 논의 필요

- 매우 큰 변경을 한 PR로 끝낼지, 기능별 PR로 나눌지.

### 선택지

1. 한 브랜치에서 순차 구현 후 한 PR로 통합한다.
2. 목록/이미지/테이블을 여러 PR로 나눈다.

### 추천

- 사용자 목표가 에디터 사용성의 일관된 완성이라 1안을 기본으로 진행한다. 단, 검증 실패나 충돌이 크면 PR 분리는 가능하게 한다.

### 사용자 방향

- 1~8차 계획 전부 진행한다.

## 2차 — 목록 Tab/Shift+Tab 표준 동작

### 작업내용

- 목록 안 Tab은 하위 목록 들여쓰기, Shift+Tab은 상위 목록 내어쓰기로 변경한다.
- 코드블록 안 Tab indent는 유지한다.

### 논의 필요

- 일반 문단 Tab은 포커스 이동을 허용할지 공백 입력을 유지할지.

### 선택지

1. 일반 문단 Tab은 기본 브라우저 동작으로 둔다.
2. 일반 문단 Tab도 공백 입력으로 둔다.

### 추천

- 1안. 일반 문단에서 Tab을 가로채지 않는 편이 접근성에 맞다.

### 사용자 방향

- 목록 Tab은 하위목록 들여쓰기 역할로 바꾼다.

## 3차 — 실제 Table 노드 도입

### 작업내용

- 마크다운 텍스트 라인 기반 표를 TipTap table/tableRow/tableCell/tableHeader 노드로 전환한다.
- 표 삽입, HTML table 붙여넣기, TSV 붙여넣기를 실제 table node로 넣는다.

### 논의 필요

- 기존 저장 카드에 남아있는 마크다운 표 문단을 즉시 변환할지, 렌더 호환을 먼저 유지할지.

### 선택지

1. 입력/붙여넣기부터 table node로 전환하고 기존 렌더 호환은 유지한다.
2. 기존 문단 마크다운 표까지 저장 시 자동 변환한다.

### 추천

- 1안. 기존 데이터 손상 없이 신규 UX부터 개선한다.

### 사용자 방향

- 테이블 노드로 작동하게 한다.

## 4차 — Obsidian식 표 + 버튼 UX

### 작업내용

- 표 선택/hover 위치를 계산해 오른쪽/아래쪽에 `+` 버튼을 노출한다.
- 오른쪽 +는 뒤에 열 추가, 아래 +는 아래에 행 추가로 동작한다.
- 버튼에는 tooltip/aria-label을 제공한다.

### 논의 필요

- 모든 셀 경계마다 +를 둘지, 표 전체 오른쪽/아래에 하나씩 둘지.

### 선택지

1. 우선 표 전체 오른쪽/아래에 하나씩 제공한다.
2. 셀/행/열 경계마다 정밀 버튼을 제공한다.

### 추천

- 1안. 현재 모달 크기와 구현 리스크를 고려해 첫 버전은 전체 표 기준으로 제공하고, 필요 시 정밀 버튼으로 확장한다.

### 사용자 방향

- 커서를 대면 +가 나오고 tooltip으로 뒤에 열 추가하기 같은 설명이 나온다.

## 5차 — Markdown 복사 직렬화

### 작업내용

- 에디터 내부는 rich node로 유지하되, plain text clipboard는 Markdown으로 직렬화한다.
- table node는 Markdown table, image node는 `![alt](src)`, list/code/quote는 Markdown 문법으로 변환한다.

### 논의 필요

- YouTube embed 복사 시 원본 URL을 유지할지 iframe URL을 쓸지.

### 선택지

1. src/embed URL을 Markdown link로 복사한다.
2. 별도 원본 URL attr를 도입한다.

### 추천

- 1안으로 시작하고 추후 원본 URL 보존이 필요하면 attr를 추가한다.

### 사용자 방향

- 복사할 때는 잘 마크다운식으로 복사되게 한다.

## 6차 — 이미지 노드/Markdown 복사 정합성

### 작업내용

- 이미지 노드는 현재처럼 크기 조절 가능한 실제 image node로 유지한다.
- Markdown 복사 시 `![alt](src)`로 직렬화한다.
- 이미지 HTML/파일/데이터 URL 붙여넣기 경로가 table 전환과 충돌하지 않게 한다.

### 논의 필요

- 이미지 width를 Markdown에 HTML로 포함할지 순수 Markdown만 쓸지.

### 선택지

1. plain text는 순수 Markdown 이미지 문법만 사용한다.
2. width 보존을 위해 HTML img로 복사한다.

### 추천

- 1안. 사용자가 “마크다운식”을 요구했으므로 plain text는 호환성을 우선한다.

### 사용자 방향

- 이미지도 노드로 나오지만 복붙할 때는 Markdown으로 된다.

## 7차 — Ctrl+V 이미지 업로드 502 원인 추적/수정

### 작업내용

- 프론트 `card-service-fetch.ts` → Next route → Spring asset client → Spring/R2 endpoint를 따라 502 원인을 확인한다.
- 응답 메시지를 사용자에게 안전한 한국어로 노출하고 업로드 상태가 꼬이지 않게 한다.

### 논의 필요

- 원인이 로컬 Spring/env/R2 설정이면 코드에서 어디까지 방어할지.

### 선택지

1. 코드 경로 버그는 수정하고, 환경 문제는 정확한 에러 메시지/로그로 구분한다.
2. 로컬 환경까지 자동 fallback 저장소를 만든다.

### 추천

- 1안. 신규 저장 원천을 Next에 만들지 않는다.

### 사용자 방향

- Ctrl+V 이미지 등록이 안 되는 버그도 고친다.

## 8차 — 통합 검증/배포

### 작업내용

- lint/typecheck/test/build 필요 범위를 실행한다.
- 가능하면 Playwright/로컬 브라우저로 목록, 테이블, 이미지 복사/붙여넣기를 확인한다.
- commit → push → PR(main) → merge를 진행한다.

### 논의 필요

- 로컬 dev 서버를 에이전트가 띄울지, 기존 서버를 재사용할지.

### 선택지

1. 관련 포트 확인 후 기존 서버 재사용, 없으면 필요한 경우만 기동한다.
2. 로컬 서버 없이 단위 테스트와 코드 검증만 한다.

### 추천

- 1안. 이 작업은 실제 에디터 UX 확인이 중요하다.

### 사용자 방향

- 작업하고 나면 main 배포 흐름까지 진행한다.

## 진행 결과

- 2차: 목록 안 Tab/Shift+Tab을 TipTap list indent/outdent로 전환했다.
- 3차: 신규 표 삽입/HTML table paste/TSV paste는 실제 TipTap table node로 저장된다.
- 4차: 표 hover/선택 시 오른쪽/아래 `+` 버튼과 tooltip을 제공한다.
- 5~6차: plain text 복사 시 table/image/list/code/quote/heading을 Markdown으로 직렬화한다.
- 7차: 로컬 개발 환경에서 R2 env 누락으로 asset upload가 502가 되는 경우 Spring 로컬 파일 저장소 fallback을 사용한다.
- 8차: lint/typecheck/targeted vitest/backend test/diff-check/web build를 통과했다.
