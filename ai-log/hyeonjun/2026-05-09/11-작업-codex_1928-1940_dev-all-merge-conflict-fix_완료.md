# dev:all 충돌 해소

## 작업내용
- `scripts/dev-all.mjs`에서 병합 충돌 마커를 제거하고 `1aa60cc(저장)` 기준 신버전(포트 스캔/백엔드 탐지/레거시 모드 지원)으로 정리.
- `apps/web/src/features/typing-service/typing-room-screen.tsx` 충돌 마커를 제거해 분석 이벤트 추적 로직( `trackedRoomEntryRef`, `room_created/joined`, `room_create_success` )이 일관되게 유지되도록 정리.
- 관련 형식 검사(`pnpm prettier --check`) 및 `node --check` 통과.

## 논의 필요
- 없음.

## 선택지
- 백엔드 실행기 미탐지시 `gradlew`/`mvnw` 대응 코드를 유지한 현 상태에서 계속 진행.

## 추천
- 현재 브랜치 충돌 해소 후, `dev:all` 실행 가능성 점검용으로 백엔드 소스 경로 상태 확인.

## 사용자 방향
- 현재 진행 반영.

## 검증
- `node --check scripts/dev-all.mjs`
- `node --check scripts/dev-ports.mjs`
- `pnpm prettier --check .github/workflows/docker-image.yml scripts/dev-all.mjs scripts/dev-ports.mjs apps/web/src/features/typing-service/typing-room-screen.tsx`
- `pnpm --filter @yeon/web exec tsc --pretty false --noEmit -p tsconfig.json` (현재 브랜치 기존 오류 다수로 실패)
