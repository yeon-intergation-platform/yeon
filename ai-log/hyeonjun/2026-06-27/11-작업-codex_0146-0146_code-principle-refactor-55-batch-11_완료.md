# 코드 품질 원칙 리팩터링 55개 배치 11

## 범위

- 대상: 33, 51, 52, 53, 54, 55번
- 서비스: 커뮤니티, 타자 서비스
- 브랜치: `codex/principle-refactor-55-batch-11`

## 변경

- 타자 영토전 결과 표시 조건을 `canShowTerritoryBattleResult`로 분리해 화면의 상태 전이 조건을 단일화했다.
- 커뮤니티 게스트 identity 저장소 read/write/remove 실패 처리와 fallback logging을 공용 helper로 정리했다.
- 커뮤니티 presence legacy session id cleanup 경계 테스트를 추가했다.
- 커뮤니티 게스트 identity confirm queue 흐름을 `runOrQueueCommunityGuestIdentityAction`으로 공용화해 목록/상세 mutation 반복을 제거했다.
- 커뮤니티 채팅 draft trim 정책을 `normalizeCommunityChatMessageDraft`로 통합해 전송 가능 조건과 실제 submit payload를 맞췄다.
- 55개 리팩터링 장부를 완료 상태로 갱신했다.

## 검증

- `pnpm --filter @yeon/web exec vitest run src/features/typing-service/use-territory-battle-room.test.ts src/features/community/__tests__/community-guest-identity.test.ts src/features/community/__tests__/community-presence.test.ts src/features/community/__tests__/community-post-format.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
