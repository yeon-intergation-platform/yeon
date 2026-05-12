# member panel model hook 분리

## 목표

- `member-panel.tsx`의 파생 모델과 export 상태를 feature hook/lib로 이동한다.
- app component는 렌더링 중심으로 줄인다.

## 변경

- `member-panel-format.ts` 추가
- `use-member-panel-model.ts` 추가
- `member-panel.tsx` hook 사용으로 정리
- `member-panel.tsx` 284줄에서 233줄로 축소

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
