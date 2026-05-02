---
name: drizzle-migration-workflow
description: |-
  yeon 웹 앱의 Drizzle ORM 스키마 변경/마이그레이션 작성 절차. drift 사전 점검, NOT NULL 추가 단계 분리, SQLSTATE 이중 처리, 자동 배포 파이프라인 영향 검증을 통일한다. 트리거: `apps/web/src/server/db/schema*.ts`, `migrations/`, `drizzle.config.ts` 변경 또는 `pgTable`/`integer`/`text` 등 Drizzle 컬럼 정의 신규 작성·수정.
---

# drizzle-migration-workflow

이 파일은 **Codex 측 얇은 wrapper**다. 절차의 실제 출처는 아래 SSOT 파일이다.

## Source of Truth

- `.claude/commands/drizzle-migration-workflow.md`

## Execution

**첫 단계로 반드시 source 파일을 Read 하라.** 본 wrapper 의 요약이나 지시어만으로 절차를 수행하지 말 것.

1. `Read(".claude/commands/drizzle-migration-workflow.md")` 을 즉시 호출하여 전체 내용을 받는다.
2. 그 문서의 절차, 체크리스트, 출력 형식을 authoritative 하게 그대로 따른다.
3. 사용자가 전달한 인자($ARGUMENTS)가 있으면 그 의도를 유지한 채 동일 workflow 로 실행한다.
4. 이 wrapper 는 `bin/sync-skills.sh` 가 자동 생성한다. 직접 수정하지 말고 SSOT 파일을 편집한다.
