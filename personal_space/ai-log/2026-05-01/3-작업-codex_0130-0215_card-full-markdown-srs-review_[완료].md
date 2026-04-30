# 작업-codex | 카드 전체 본문·Markdown·SRS 리뷰 모드

- 주체: Codex CLI
- 워크트리: A (/home/osuma/coding_stuffs/yeon)
- 브랜치: main
- 작업창(예상): 01:30 ~ 02:30
- 실제 시작: 01:30
- 실제 종료: 02:15
- 상태: 완료

## 파일·디렉토리 범위 (whitelist)
- apps/web/src/features/card-service/**
- apps/mobile/src/features/card-service/**
- packages/api-contract/**
- packages/api-client/**
- apps/web/src/app/api/card-service/**
- apps/web/src/server/services/card-decks-service.ts
- apps/web/src/server/db/schema/**, apps/web/src/server/db/migrations/**
- package.json / pnpm-lock.yaml (Markdown editor dependency 필요 시)

## 절대 건드리지 않을 범위 (상대 주체 담당)
- 카드 서비스 외 제품 도메인
- 기존 인증/결제/상담 기록 도메인

## 상대 주체 현황 스냅샷
- main 최신 배포 후 카드 row 2-line clamp가 사용자 요구와 불일치.
- 이전 output/ 및 1번 로그는 untracked.

## 차수별 작업내용
1. deep-interview 확정: 카드 목록 항상 전체 노출.
2. deep-interview 확정: 계정 동기화 SRS + 고정 간격 MVP(어려움 1일/좋음 3일/쉬움 4일).
3. 사용자 추가 요구: Markdown 에디터/렌더 지원.
4. 구현·검증·main 반영.


## 완료 검증
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/mobile typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/mobile lint` 통과
- `pnpm --filter @yeon/web db:check:drift` 통과 (`Schema drift 없음`)
- `pnpm --filter @yeon/web build` 통과
- Playwright 수동 검증 통과: 카드 row 전체 본문/Markdown 표시, 접기 UI 제거, 복습 모드 저장, 어려움 1일 후 SRS 저장, 재정렬 후 다음 카드 표시

## 남은 참고사항
- `output/` 및 1번 완료 로그는 기존 untracked로 유지.
- 전체 web vitest suite는 이 작업 전부터 존재한 schema mock/인증 콜백 등 비관련 실패가 있어 targeted 검증과 빌드/타입/브라우저 검증으로 대체.
