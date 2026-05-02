---
name: zod-contract-conventions
description: |
  yeon `packages/api-contract/` Zod 스키마 작성 컨벤션. as const + literal union, request/response 짝, 필드 변경 영향 절차를 통일한다. 트리거: 경로가 `packages/api-contract/**`이거나 `z.object`/`z.discriminatedUnion`을 신규 작성/수정할 때.
---

# zod-contract-conventions

## Purpose

`@yeon/api-contract`는 web/mobile/race-server가 공유하는 단일 스키마 패키지다. 작성 컨벤션이 통일되지 않으면 (a) 추론 타입이 소비자 코드를 무음으로 깨뜨리거나, (b) enum 런타임 산출이 번들에 침투하거나, (c) request/response가 비대칭으로 흩어진다.

## Use_When

- 경로가 `packages/api-contract/src/**`인 파일을 수정·생성할 때
- `z.object`, `z.discriminatedUnion`, `z.union`, `z.enum` 신규 사용
- DTO/Request/Response 타입을 추가·변경·삭제할 때
- 모바일과 웹의 계약을 분리해야 하는 상황 (예: credential response)

## Do_Not_Use_When

- `packages/api-client/`처럼 contract를 소비만 하는 곳 (이쪽은 contract 변경 영향만 검토)
- `apps/**`에서 `z.object`로 폼 validation만 작성 (UI 폼 schema는 contract 아님)
- 외부 API 응답을 일회성 parse하는 코드

## Why_This_Exists

contract 변경은 web + mobile + race-server에 동시 영향. 필드 rename/remove 시 소비자 전수 검토 없이 진행하면 빌드 깨짐. 또 TypeScript `enum`을 contract에 쓰면 트리쉐이킹 어려움 + dual import 문제 → `as const` + literal union이 표준.

## Conventions

### 1. enum 대신 `as const` + literal union

```ts
// 좋음
export const CARD_STUDY_MODES = {
  flashcard: "flashcard",
  review: "review",
} as const;
export type CardStudyMode =
  (typeof CARD_STUDY_MODES)[keyof typeof CARD_STUDY_MODES];
export const cardStudyModeSchema = z.enum([
  CARD_STUDY_MODES.flashcard,
  CARD_STUDY_MODES.review,
]);

// 나쁨 — 런타임 산출, 트리쉐이킹 약함
export enum CardStudyMode {
  Flashcard = "flashcard",
  Review = "review",
}
```

`z.enum`은 유효성 검사용으로만 쓰고, 비교/스위치 분기는 위 상수 객체로.

### 2. request/response는 한 파일에 짝으로

- `card-decks.ts` 안에 `CreateCardDeckBody`(요청) + `CardDeckDto`(응답 단일) + `CardDeckListResponse`(응답 목록)이 함께 살아야 한다.
- 같은 도메인이 두 파일로 쪼개지면 변경 누락 위험.

### 3. 추론 타입 export 필수

```ts
export const cardDeckDtoSchema = z.object({ ... });
export type CardDeckDto = z.infer<typeof cardDeckDtoSchema>;
```

소비자는 schema가 아니라 type만 import해서 깔끔하게 사용.

### 4. discriminated union은 `kind`/`type` 단일 키로

```ts
export const deckPlayViewStateSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("loading") }),
  z.object({ kind: z.literal("error"), message: z.string() }),
  z.object({ kind: z.literal("ready"), deck: cardDeckDtoSchema }),
]);
```

discriminator 키 이름은 도메인 내에서 통일 (보통 `kind`).

### 5. 신규 필드는 optional 또는 default

```ts
// 좋음 — 하위 호환
deletedAt: z.string().datetime().nullable().optional(),
shuffleDefault: z.boolean().default(false),

// 나쁨 — 구버전 클라이언트 응답 parse 깨짐
shuffleDefault: z.boolean(),
```

### 6. 필드 제거/rename은 소비자 전수 확인 후

변경 전 필수 점검:

```bash
grep -r 'from "@yeon/api-contract/<file>"' apps/ packages/api-client/
```

영향 범위 표(`.claude/rules/api-contract.md` 참조):

- `typing-decks.ts` → `apps/web/typing-service/`, `apps/race-server/`
- `card-decks.ts` → `apps/web/card-service/`, `apps/mobile/card-service/`
- `auth.ts`, `credential.ts` → `apps/web/auth-credentials/`, `apps/mobile/`

### 7. mobile / web 계약 분리는 명시적

- 한 파일 안에서 `webCredentialResponseSchema`, `mobileCredentialResponseSchema` 별도 export.
- 공통부는 `baseCredentialSchema`로 추출 후 extend.

### 8. 비즈니스 로직, HTTP 코드는 contract에 두지 않음

- contract는 Zod 스키마 + 타입 + 상수 객체만. fetch 함수, validation 헬퍼, 요청 빌더는 `packages/api-client/`로.

## Anti-Patterns

❌ `z.string()` 만 적고 형식 제약 없음 → `z.string().email()`, `z.string().datetime()`, `z.string().min(1)` 명시
❌ `z.any()`, `z.unknown()` — 타입 안전성 포기
❌ 같은 의미 필드를 여러 schema에 복붙 → 공통 schema extract 후 `.extend()` 또는 `.merge()`
❌ schema 정의는 contract에, 타입은 다른 파일에 — 함께 export
❌ `enum` (TypeScript native)
❌ `z.object({ ... }).strict()` 일관성 없이 일부에만 적용 → 도메인 정책으로 통일

## Verification

- 변경 후 `pnpm --filter @yeon/web typecheck` (contract 변경 → 추론 타입 변경 → 소비자 컴파일 에러 검출)
- `pnpm --filter @yeon/mobile typecheck` (모바일 소비자)
- `apps/race-server/` 변경 영향 받으면 `pnpm --filter @yeon/race-server typecheck`

## References

- 룰 SSOT: `.claude/rules/api-contract.md`
- 기준 파일: `packages/api-contract/src/card-decks.ts`
- 모바일 분기 예: `packages/api-contract/src/credential.ts`
