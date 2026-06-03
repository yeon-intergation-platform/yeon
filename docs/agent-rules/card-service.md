# Card Decks — 덱 생성·카드 편집·학습 진입이 먼저 보이는 흰 배경 생산성 UI

> SSOT. `.claude/rules/card-service.md`와 `.codex/skills/SHARED/card-service/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## UI 제약

- 배경: 흰색(`bg-white`), 텍스트: `#111`, 보더: `#e5e5e5`
- CTA: 검정(`#111`), 비파괴 액션: 회색 보더 버튼
- 병합 강조도 오렌지를 쓰지 않는다. 게스트 덱 병합 UX는 `#fafafa` 배경 + `#666` 텍스트 + `#e5e5e5` 보더로 처리한다.

## 주요 파일

- `apps/web/src/features/card-service/card-service-home.tsx` — 홈 (상태 머신)
- `apps/web/src/features/card-service/deck-detail-screen.tsx` — 덱 편집
- `apps/web/src/features/card-service/deck-play-screen.tsx` — 카드 학습
- `apps/web/src/features/card-service/hooks/use-deck-list.ts` — 게스트/서버 분기
- `apps/web/src/features/card-service/hooks/use-deck-mutations.ts` — CRUD

## 게스트/인증 분기 — 항상 양쪽 확인

- 게스트 로컬 store: `apps/web/src/lib/guest-card-service-store`
- 인증 후 자동 병합 UX: `components/merge-guest-dialog.tsx`
- API 흐름과 로컬 저장소 흐름이 항상 동시에 동작해야 함

## API & 연동

- Contract: `@yeon/api-contract/card-decks`
- **모바일 연동**: `apps/mobile/src/features/card-service/**` — contract 변경 시 영향 확인
- 제품/디자인 문서 없음 — 구현 코드가 근거
