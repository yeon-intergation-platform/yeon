# API Contract — contract 변경은 web + mobile + race-server 전부 영향

> SSOT. `.claude/rules/api-contract.md`와 `.codex/skills/SHARED/api-contract/SKILL.md`는 이 파일의 wrapper다.
> 규칙 변경은 이 파일에서만 한다.

## 변경 전 필수 확인
```bash
# 소비자 목록 확인 (변경할 파일명으로 grep)
grep -r 'from "@yeon/api-contract/<파일명>"' apps/ packages/api-client/
```

## 영향 범위
| 변경 위치 | 영향받는 곳 |
|---------|----------|
| `typing-decks.ts` | `apps/web/src/features/typing-service/`, `apps/race-server/` |
| `card-decks.ts` | `apps/web/src/features/card-service/`, `apps/mobile/src/features/card-service/` |
| `counseling-records.ts` | `apps/web/src/features/counseling-record-workspace/` |
| `auth.ts`, `credential.ts` | `apps/web/src/features/auth-credentials/`, `apps/mobile/src/` |

## Zod 스키마 규칙
- 스키마 변경 → 추론 타입 자동 변경 → 타입체크 필수: `pnpm --filter @yeon/web typecheck`
- 필드 제거/rename: 소비자 전수 확인 후 진행
- 신규 필드: optional 또는 기본값 제공 (하위 호환)

## 패키지 경계
- contract: Zod 스키마 + 타입 + DTO만
- 비즈니스 로직, HTTP 클라이언트 코드는 `packages/api-client/`로
