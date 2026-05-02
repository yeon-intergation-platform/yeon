---
name: drizzle-migration-workflow
description: |
  yeon 웹 앱의 Drizzle ORM 스키마 변경/마이그레이션 작성 절차. drift 사전 점검, NOT NULL 추가 단계 분리, SQLSTATE 이중 처리, 자동 배포 파이프라인 영향 검증을 통일한다. 트리거: `apps/web/src/server/db/schema*.ts`, `migrations/`, `drizzle.config.ts` 변경 또는 `pgTable`/`integer`/`text` 등 Drizzle 컬럼 정의 신규 작성·수정.
---

# drizzle-migration-workflow

## Purpose

DB 스키마 변경은 자동 배포 파이프라인을 거쳐 즉시 production에 반영된다. 미리 drift를 잡지 않거나 NOT NULL을 단계 분리하지 않으면 실서비스 다운타임 또는 마이그레이션 실패가 발생한다.

## Use_When

- `apps/web/src/server/db/schema/**` 또는 `apps/web/src/server/db/schema.ts` 수정·생성
- `apps/web/src/server/db/migrations/**` 신규 마이그레이션 추가
- `drizzle.config.ts` 변경
- `pgTable`, `pgEnum`, `integer`, `text`, `timestamp`, `index`, `uniqueIndex` 신규 사용
- 기존 컬럼에 NOT NULL/UNIQUE/FOREIGN KEY 제약 추가

## Do_Not_Use_When

- 단순 query 작성 (서비스/레포 레이어에서 schema import만 하는 경우)
- 테스트 fixture 작성
- DTO/Zod schema 작성 (이쪽은 `zod-contract-conventions`)

## Why_This_Exists

AGENTS.md에 한 줄로만 명시된 절차 — `pnpm db:diff`로 drift 점검, migration 파일 추가, SQLSTATE 이중 처리, 자동 배포 영향 확인. 이 절차가 매번 빠지거나 일부만 수행되어 실서비스 사고로 이어진다.

## Workflow

### Step 1: 변경 의도 명확화

변경을 시작하기 전 한 줄로 답하라:

- 무슨 컬럼/테이블/제약을 추가/수정/삭제하나?
- 이 변경이 production 데이터에 어떤 영향을 주나?
- 롤백 가능한가? 불가능하면 backfill 전략은?

### Step 2: drift 사전 점검 (필수)

```bash
pnpm --filter @yeon/web db:diff
```

- 출력에 unexpected diff가 있으면 누군가의 미반영 schema 변경 → 작업 시작 금지, 확인 후 진행
- 깨끗한 상태에서만 새 schema 변경 시작

### Step 3: schema 수정

- snake_case 컬럼명 (`created_at`, `card_deck_id`)
- 모든 테이블에 `id` PK + `created_at`/`updated_at` (선례 따름)
- FK는 명시적: `references(() => cardDecks.id, { onDelete: "cascade" })`
- nullable 기본 → 신규 컬럼은 nullable로 시작, backfill 후 NOT NULL 단계 분리

### Step 4: NOT NULL 추가는 3단계 분리 (production 데이터 있는 컬럼)

1. nullable 컬럼 추가 + default (필요시) — migration A
2. 코드 배포 + backfill 스크립트로 기존 row 채움
3. NOT NULL 제약 추가 — migration B

한 번에 NOT NULL 추가하면 기존 row가 위반 → 배포 실패.

### Step 5: 마이그레이션 생성

```bash
pnpm --filter @yeon/web db:generate
```

- 생성된 SQL 파일을 **반드시** 사람이 검토
- 자동 생성이 의도와 다른 케이스: 컬럼 rename은 drop+add로 잡힘 (데이터 손실) → 수동 수정 필요

### Step 6: SQLSTATE 이중 처리

- unique 제약 위반 등은 PostgreSQL `error.code` 비교 (예: `23505`)
- ORM 메시지 문자열 비교 금지 (드라이버 버전 따라 변경됨)

```ts
try { await db.insert(...) } catch (err) {
  if (isPgError(err) && err.code === "23505") throw new ConflictError("이미 존재하는 항목입니다.");
  throw err;
}
```

### Step 7: 자동 배포 파이프라인 영향 확인

- yeon은 main merge → 자동 배포가 있다 (`AGENTS.md`)
- migration이 production에 즉시 적용 → reversible 여부 확인
- breaking change면 코드 배포 순서 (구 코드 + 신 schema 호환성) 검토

### Step 8: 로컬 적용 + 검증

```bash
pnpm --filter @yeon/web db:migrate
pnpm --filter @yeon/web typecheck
```

- 타입 추론 변경으로 깨진 소비자 코드 수정

### Step 9: 영향받는 서비스/레포 동시 수정

- `src/server/repositories/<entity>.ts` — 새 컬럼 select/insert
- `src/server/services/<entity>.ts` — 비즈니스 로직 반영
- `packages/api-contract/` — API 응답 schema 동기화 필요?

## Anti-Patterns

❌ schema만 바꾸고 migration 안 만듦 → drift 누적
❌ migration SQL 자동 생성 결과 review 없이 commit
❌ rename을 drop+add로 두면 데이터 손실 → 수동 SQL 수정 필요
❌ NOT NULL을 한 번에 추가
❌ camelCase 컬럼명 (`createdAt`) — Drizzle은 SQL 컬럼명에 그대로 노출
❌ FK 누락 → 고아 row 발생 가능
❌ 새 컬럼 추가 후 select 시 typed result에 누락 → typecheck 실패 무시

## Verification

- `pnpm --filter @yeon/web db:diff` → 0 diff
- `pnpm --filter @yeon/web typecheck` → 0 error
- migration 파일을 직접 읽어 의도와 일치하는지
- 영향받는 service/repository 테스트 실행 (모킹 금지, 실 DB)

## References

- 룰 SSOT: `.claude/rules/server-services.md`
- AGENTS.md "DB schema 변경 표준 절차"
- 기준 schema: `apps/web/src/server/db/schema/`
