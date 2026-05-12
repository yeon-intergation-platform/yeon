# 카드 마크다운 에디터 v2 구현

## 목표

카드 에디터 v2 백로그 전체를 구현한다: 아이콘 툴바, 이미지 파일 선택/드롭/붙여넣기 안정화, 본문 중간 이미지 삽입, 이미지 크기 조절 유지, 데스크톱 오른쪽 preview/모바일 preview 접근, 회귀 테스트.

## 진행

- 작업 브랜치: `codex/card-markdown-editor-v2`
- 기준: `origin/main`

## 구현 요약

- 카드 에디터 툴바를 텍스트 버튼 나열에서 아이콘 중심 버튼으로 분리했다.
- 이미지 파일 선택, 드래그앤드롭, 붙여넣기, Clipboard API fallback을 동일 업로드/삽입 경로로 통합했다.
- TipTap 이미지 node view에 resize handle을 붙이고 `width` 속성을 HTML에 보존하도록 분리했다.
- 데스크톱은 editor/preview 2-pane, 모바일은 작성/미리보기 전환으로 구성했다.
- 이미지 width/count/file validation 순수 함수 테스트를 추가했다.

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web exec vitest run src/features/card-service/components/card-editor-image-utils.test.ts` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check && bash bin/sync-skills.sh --check && bash bin/verify-ssot.sh --project-only` 통과

## 주의

- 현재 워킹트리에는 별도 백엔드 ObjectMapper/JDBC 작업 변경이 함께 존재하므로 카드 에디터 구현 PR에는 owned 파일만 포함한다.
