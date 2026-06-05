# 작업 로그 — Discord AI 메인 카드 + 카드 코드 언어 UX

## 목표

1. yeon.world 메인 서비스 카드에 discord-ai.yeon.world 진입 카드 추가.
2. 카드 저장/추가 모달에서 코드블록 입력 중 흔들림 제거.
3. 미리보기 코드블록 언어 드롭다운/문법별 하이라이트와 편집 패널 코드블록 시각 구분 추가.

## 진행

- 2026-06-06: `yeon-4`를 `origin/main` 기준 `codex/home-discord-card-code-preview` 브랜치로 전환.
- 백로그 작성: `docs/product/backlog/card-code-language-and-discord-entry-20260606.md`.
- 메인 플랫폼 서비스 목록에 `Discord AI 어시스턴트` 카드를 추가하고 `https://discord-ai.yeon.world`로 연결.
- 카드 마크다운 코드블록의 언어 선택 옵션과 alias 정규화, rich content/markdown fence 언어 변경 유틸을 추가.
- 카드 미리보기 코드블록에 언어 드롭다운과 경량 문법 하이라이트를 적용.
- 카드 추가/편집 패널의 코드블록 시각 구분을 강화하고 manual add 모달 높이를 고정해 코드 입력 중 레이아웃 흔들림을 줄임.

## 검증

- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `git diff --check` 통과.
- `pnpm --filter @yeon/web build` 통과.
- 로컬 backend `http://127.0.0.1:8082/actuator/health` 응답 `UP` 확인.
- Playwright(system Chrome)로 `http://127.0.0.1:3000/` 메인 카드 노출과 `https://discord-ai.yeon.world` 링크 확인.

## 비고

- 로컬 검증을 위해 web(3000), backend(8082), race-server(2567), PostgreSQL 컨테이너를 유지한다.
