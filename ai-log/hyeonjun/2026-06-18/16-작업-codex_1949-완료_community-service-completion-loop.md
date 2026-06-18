# 16 작업 - community service completion loop

## 목표

- 커뮤니티 서비스를 한 서비스 범위로 고정해 완성도 루프를 수행한다.
- Playwright 실제 사용 감사, P0/P1/P2 분류, 작은 묶음 수정, 재발 방지 게이트 추가, 검증, PR(main) 반영까지 진행한다.

## 제약

- base/PR target은 `main`이다.
- `develop`은 사용하지 않는다.
- `yeon-2`의 타자/i18n dirty worktree와 섞지 않는다.
- 상담 워크스페이스는 건드리지 않는다.
- 신규 backend 소유권은 Spring(`apps/backend`)에 둔다.
- 수정은 community 서비스와 필요한 검증 게이트에 한정한다.

## 진행 메모

- 브랜치: `qa/community-completion-loop-20260618`
- 시작 기준: `origin/main`
- 서비스 범위: `community`
- 루프 한도: 최대 5사이클, 같은 실패 3회 반복 시 중단 보고

## 사이클 1 계획

- 현재 코드 source of truth 확인
- 로컬 포트와 dev 서버 재사용 가능성 확인
- Playwright 데스크톱/모바일 실제 사용 감사
- 발견 이슈 P0/P1/P2 분류
- P0/P1이 있으면 작은 묶음 수정과 재발 방지 테스트 추가

## 사이클 1 결과

### P1 - 저장된 게스트 비밀번호 오류가 런타임 에러로 전파됨

- 재현: 저장된 게스트 닉네임은 맞고 비밀번호만 틀린 상태에서 글 삭제를 누르면 화면에는 `삭제 권한이 없습니다.`가 표시되지만, mutation rejection이 호출자까지 전파되어 Next dev runtime error overlay가 뜰 수 있었다.
- 원인: 게스트 인증 모달을 건너뛰는 경로가 `run(...).then(() => true)`만 반환해 실패를 UI 오류 상태로 흡수하지 않았다.
- 수정: `runCommunityGuestIdentityAction`을 추가해 저장된 인증으로 실행한 action 실패를 `false`로 반환하게 하고, 목록/상세 페이지 양쪽에서 사용한다.
- 재발 방지: 커뮤니티 게스트 인증 단위 테스트와 opt-in Playwright 온라인 E2E를 추가했다.

### P1 - 글 수정 시 제목/카테고리 source of truth가 깨짐

- 재현: 글 작성 포맷은 `[카테고리] 제목\n본문`인데 수정 UI가 raw body 전체를 textarea에 노출했다. 사용자가 본문만 수정해 저장하면 DB body가 본문 문자열만 남아 제목은 본문으로 바뀌고 카테고리는 `잡담`으로 fallback됐다.
- 수정: 수정 UI를 카테고리/제목/본문 draft로 분리하고, 저장 직전에만 `serializeCommunityPost`를 통과하게 했다. 목록 카드와 상세 페이지가 같은 `FeedPostEditForm`을 공유한다.
- 재발 방지: `community-post-format` 단위 테스트와 Playwright 온라인 E2E에 "수정 후 제목/카테고리 보존" 시나리오를 추가했다.

## 검증

- `CI=true pnpm --filter @yeon/web exec vitest run src/features/community/__tests__/community-guest-identity.test.ts src/features/community/__tests__/community-post-format.test.ts` → 2 files / 12 tests passed
- `RUN_COMMUNITY_ONLINE_E2E=1 PLAYWRIGHT_BASE_URL=http://localhost:3006 pnpm --filter @yeon/web exec playwright test e2e/community-online.spec.ts --project=chromium` → 2 passed
- `pnpm --filter @yeon/web lint` → passed
- `pnpm --filter @yeon/web typecheck` → passed
- `git diff --check` → passed
- 로컬 feed cleanup 확인: 커뮤니티 E2E/재현 테스트 글 패턴 0건
