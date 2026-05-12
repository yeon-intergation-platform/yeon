# Yeon UI Kit v1 타자 서비스 slice 작업 로그

## 목표

- shadcn/ui 설치 없이 Yeon 내부 UI primitive를 추가한다.
- 타자 서비스의 반복 버튼/입력/카드/배지 className 일부를 primitive로 치환한다.
- 기존 게임/방 상태 로직과 API/DB는 변경하지 않는다.

## 범위

- 추가: `apps/web/src/components/yeon-ui/`
- 적용: `apps/web/src/features/typing-service/typing-service-home.tsx`, `typing-decks-screen.tsx`, `typing-room-lobby-screen.tsx` 중심
- 제외: 상담 워크스페이스 `.app-theme`, race engine/protocol, 서버 API

## 진행

- 20:38 시작. `origin/main` 기준 `feat/yeon-ui-kit-v1` 브랜치 생성.
- 기존 미커밋 타 작업 파일은 확인만 하고 staging 제외 예정.

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- 20:40~20:55 `YeonButton`, `YeonField`, `YeonSurface`, `YeonBadge` 추가.
- 타자 서비스 홈/덱/방 로비의 주요 CTA, 입력, 카드, 배지 반복 className을 primitive로 치환.
- shadcn/ui 및 새 의존성 추가 없음.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.
- `git diff --check` 통과.

## 완료 메모

- 게임 엔진, race-server protocol, 서버 API, DB schema 변경 없음.
- 기존 미커밋 타 작업 파일은 staging 제외.
