# Typing Decks Lane D — Shared race protocol and seed consumption

- Status: 작업중
- Started: 2026-05-01 KST
- Scope:
  - packages/race-shared/src/typing-race.ts
  - apps/race-server/src/rooms/typing-race-room.ts
  - apps/web/src/features/typing-service/use-race-room.ts
  - race shared/server tests if present
- Plan:
  1. Extend shared protocol types for deck metadata and raceSeed.
  2. Normalize canonical roomSeed in race-server onCreate and use for seed sends, summaries, benchmark length, fallback.
  3. Ensure useRaceRoom passes prepared createRoom raceSeed through Colyseus create options.
  4. Run targeted typechecks.

## Completion
- Status: 완료
- Actual end: 2026-05-01 10:39 KST
- Summary:
  - Added shared typing deck metadata/raceSeed protocol types.
  - Race server now normalizes a canonical roomSeed at onCreate, redacts private lobby title, broadcasts canonical seed, and computes benchmark progress from that seed.
  - useRaceRoom now materializes create options so Lane C's prepared raceSeed is passed through to Colyseus create options.
- Verification:
  - git diff --check: PASS
  - pnpm --filter @yeon/race-shared typecheck: PASS
  - pnpm --filter @yeon/race-server typecheck: PASS
  - pnpm --filter @yeon/web typecheck: PASS
  - pnpm --filter @yeon/race-shared test: PASS (1 file, 4 tests)
  - pnpm --filter @yeon/race-server lint && pnpm --filter @yeon/race-shared lint: PASS
