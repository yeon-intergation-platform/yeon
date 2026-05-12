# community random guest nickname 작업중

## 목표

커뮤니티 미로그인 기본 이름을 `익명` + 4자리 랜덤 숫자로 생성해 채팅에서 게스트를 구분할 수 있게 한다.

## 범위

- 커뮤니티 게스트 닉네임 생성/저장 유틸
- 커뮤니티 채팅 전송 기본 닉네임
- 커뮤니티 피드 기본 닉네임

## 검증 예정

- pnpm --filter @yeon/web lint
- pnpm --filter @yeon/web typecheck
- pnpm --filter @yeon/web build
- git diff --check
- bash bin/sync-skills.sh --check
- bash bin/verify-ssot.sh --project-only

## 완료 내용

- 커뮤니티 게스트 닉네임 생성 유틸을 추가했다.
- 기본 닉네임은 `익명` + 4자리 숫자로 생성하고 localStorage에 저장한다.
- 채팅 전송과 피드 기본 닉네임이 같은 유틸을 사용한다.

## 검증 결과

- pnpm --filter @yeon/web lint
- pnpm --filter @yeon/web typecheck
- pnpm --filter @yeon/web test src/features/community/**tests**/community-guest-identity.test.ts
- pnpm --filter @yeon/web build
- git diff --check
- bash bin/sync-skills.sh --check
- bash bin/verify-ssot.sh --project-only
