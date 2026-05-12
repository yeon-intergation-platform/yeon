# community chat anonymous identity/fetch boundary 정리

## 목표

- 실시간 채팅 hook 반환값에서 ID성 값을 제거한다.
- `/community`에서 설정한 게스트 닉네임을 실시간 채팅 전송 닉네임으로 사용한다.
- presence heartbeat 직접 `fetch()`를 API boundary로 이동한다.

## 검증

- 예정: community guest identity test, web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, community direct fetch/currentUserId grep.

## 완료 내용

- 실시간 채팅 hook 반환값에서 `currentUserId`/sender id 상태를 제거했다.
- `/community` 글쓰기 행의 닉네임 변경을 `yeon-community-guest-nickname` 저장소에 반영하고, feed chat widget에 현재 닉네임을 전달한다.
- 채팅 전송 시 전달된 닉네임이 저장소 값보다 우선하도록 했다.
- presence heartbeat 직접 `fetch()`는 `community-presence-api.ts` API boundary로 이동했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/features/community/__tests__/community-guest-identity.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `rg -n 'currentUserId|currentSenderId|setCurrentSenderId' apps/web/src/features/community` 출력 없음
- community 직접 fetch grep 결과는 API boundary 파일(`chat-service-api.ts`, `community-chat-api.ts`, `community-presence-api.ts`)에만 존재

## 참고

- `pnpm --filter @yeon/web test -- src/features/community/__tests__/community-guest-identity.test.ts`는 Vitest 전체 스위트를 실행해 기존 server/route mock baseline 실패와 함께 중단되어, targeted `exec vitest run`으로 재검증했다.
