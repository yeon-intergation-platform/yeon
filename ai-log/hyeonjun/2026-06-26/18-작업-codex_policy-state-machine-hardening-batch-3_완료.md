# 18 작업 codex policy-state-machine-hardening batch 3 완료

## 범위

- 커뮤니티 guest identity의 정규화, 완성 여부, feed actor payload 정책을 `community-guest-identity-confirm.ts`로 모았다.
- 커뮤니티 presence session id가 legacy/blank/공백 포함 값을 재사용하지 않도록 유효성 정책을 추가했다.
- 커뮤니티 게시글, 댓글, 실시간 채팅 작성 가능 조건을 `community-post-format.ts`의 순수 정책 함수로 고정하고 UI 호출부에서 재사용했다.

## 변경 파일

- `apps/web/src/features/community/community-guest-identity-confirm.ts`
- `apps/web/src/features/community/community-presence.ts`
- `apps/web/src/features/community/community-post-format.ts`
- `apps/web/src/features/community/hooks/use-community-feed.ts`
- `apps/web/src/features/community/components/community-chat-widget.tsx`
- `apps/web/src/features/community/components/community-chat-form.tsx`
- `apps/web/src/features/community/components/community-feed-forms.tsx`
- `apps/web/src/features/community/community-post-detail-page.tsx`
- `apps/web/src/features/community/__tests__/community-guest-identity.test.ts`
- `apps/web/src/features/community/__tests__/community-post-format.test.ts`
- `apps/web/src/features/community/__tests__/community-presence.test.ts`
- `docs/product/backlog/2026-06-26-policy-state-machine-hardening-50.md`

## 검증

- `pnpm --filter @yeon/web test -- src/features/community/__tests__/community-guest-identity.test.ts src/features/community/__tests__/community-post-format.test.ts src/features/community/__tests__/community-presence.test.ts`
  - web Vitest 227개 파일 / 1011개 테스트 통과
- `pnpm --filter @yeon/web typecheck`

## 장부

- 완료 태스크: 31, 32, 34
- 누적 완료: 31/50
