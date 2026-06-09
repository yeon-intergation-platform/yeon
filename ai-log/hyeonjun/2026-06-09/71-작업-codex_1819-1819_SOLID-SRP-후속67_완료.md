# SOLID/SRP 후속 67 — 카드 일괄 추가 폼 렌더 섹션 분리

- 대상: `apps/web/src/features/card-service/components/bulk-add-cards-form.tsx`
- 백로그: `docs/product/backlog/2026-06-09-solid-exception-300-audit.md` 222번
- 원칙: S — 하나의 컴포넌트는 하나의 이유로만 변경되게 유지

## 변경

- 일괄 추가 폼의 도움말, 입력, 인식 상태, 미리보기, 덮어쓰기 안내 섹션을 `bulk-add-cards-form-parts.tsx`로 분리했다.
- `BulkAddCardsForm`은 상태 hook 연결과 섹션 조립만 담당하도록 축소했다.
- 기존 action state export 호환은 유지했다.

## 검증

- 완료: `CI=true pnpm --filter @yeon/web lint`
- 완료: `CI=true pnpm --filter @yeon/web typecheck`
- 완료: `git diff --check`
