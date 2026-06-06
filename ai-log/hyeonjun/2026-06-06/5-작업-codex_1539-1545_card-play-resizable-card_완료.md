# 카드 플레이 카드 크기 조절 작업 로그

## 목표
- 카드 플레이 화면에서 우하단 모서리로 카드 크기 조절
- 다음/이전 문제 이동 후에도 조절한 크기 유지

## 진행
- 작업 브랜치: codex/card-play-resizable-card
- 작업 워크트리: yeon-4

## 완료
- 카드 플레이 카드에 우하단 리사이즈 핸들 추가
- 덱별 localStorage 저장으로 다음/이전 문제 및 새로고침 후 크기 유지
- 키보드 방향키로도 핸들 포커스 시 크기 조절 가능

## 검증
- `pnpm --filter @yeon/web test src/features/card-service/utils/card-play-card-size.test.ts`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `git diff --check`
- `pnpm build:web`
- Playwright smoke: 720x380 → 870x470 리사이즈, 다음 문제 이동 후 870x470 유지, localStorage 저장 확인
