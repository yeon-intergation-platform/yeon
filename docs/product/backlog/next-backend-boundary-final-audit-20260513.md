# Next backend-role 최종 감사 실행 백로그 (2026-05-13)

## 배경
- `apps/web/src/app/api/**/route.ts`를 대상으로 한 Next backend-role 잔존 여부를 한 번에 마감한다.
- 결과는 `docs/architecture/next-backend-boundary-audit.md`에 정식 기록한다.

## 차수 1

### 작업내용
1. `origin/main` 최신 반영 후 전용 브랜치 생성.
2. `apps/web/src/app/api/**/route.ts` 전수 스캔을 기반으로 라우트 단위 분류 수행.
3. `docs/architecture/next-backend-boundary-audit.md`에 판단 근거(핵심 import/호출 대상/카테고리) 기록.
4. `@/server/services/service-error` 경로를 `@/server/errors/service-error`로 통일하고, legacy 경로는 shim 1곳만 유지.
5. 인증/session/OAuth 대상 라우트의 source-of-truth 판정 및 최종 표기.

### 논의 필요
- 인증/세션 라우트(`api/auth/**`, `api/v1/auth/session`, `api/v1/mobile/auth/credentials/login`)는 현재 소유권이 Next cookie bridge인지, Next에서 권한 판단이 추가된 부분이 있는지의 1차 분류 기준.

### 선택지
- A. 1차 분류만 문서화하고 분리 보수는 차기 PR로 미루기
- B. 잔여 라우트가 나오면 동일 PR에서 즉시 이동 범위 확정

### 추천
- A의 실행은 범위를 늘리면 위험이 크므로, 잔여가 있으면 B로 확장하되 현재 PR은 1회 최종 감사 + service-error 오탐 정리 + auth/session 브리지 규칙 정합성 확인에 맞춘다.

### 사용자 방향
- 추천(A 우선, 잔여 발견 시 B로 확장)

## 차수 2

### 작업내용
1. 정적 감사 재실행 스캔값 재확인.
2. `pnpm --filter @yeon/web lint`, `typecheck`, `build` 실행.
3. 변경 파일 `git diff --check`/`bin/sync-skills.sh --check`/`bin/verify-ssot.sh --project-only` 실행.

### 논의 필요
- 없음.

### 선택지
- 정적/빌드 통과 후 PR 제출.

### 추천
- 정적/빌드 통과.

### 사용자 방향
- 추천
