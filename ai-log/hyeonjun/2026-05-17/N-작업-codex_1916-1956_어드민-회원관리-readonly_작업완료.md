# 어드민 회원관리 read-only 구현

## 목표

- deep-interview spec `.omx/specs/deep-interview-admin-member-management.md` 기준으로 플랫폼 유저 read-only 회원관리 페이지를 구현한다.

## 범위

- Spring users 응답 확장 및 관리자 권한 하드닝.
- Web `/admin` 하위 회원관리 리스트 페이지 추가.
- Contract/API client 타입 갱신.
- 관련 테스트/검증 후 PR(main)으로 배포 흐름 진행.

## 상태

- 작업중.

## 구현 요약

- Spring users 응답에 `role`, `lastLoginAt`을 추가하고 목록/생성 응답 DTO를 확장했다.
- Spring users 서비스에서 관리자 권한을 확인하도록 하드닝했다.
- `/admin`은 `/admin/members`로 연결하고, `/admin/members`에 read-only 회원 리스트를 추가했다.
- 기존 타자 덱 관리자 상단에 회원관리 진입 링크를 추가했다.

## 검증

- `./gradlew test --tests 'world.yeon.backend.users.*'` 통과.
- `pnpm --filter @yeon/api-contract test -- users` 통과.
- `pnpm --filter @yeon/web test src/app/api/v1/users/__tests__/route.test.ts` 통과.
- `pnpm --filter @yeon/api-contract typecheck` 통과.
- `pnpm --filter @yeon/api-client typecheck` 통과.
- `pnpm --filter @yeon/web typecheck` 통과.
- `pnpm --filter @yeon/web lint` 통과.
- `pnpm --filter @yeon/web build` 통과.

## 비고

- `pnpm --filter @yeon/web test -- src/app/api/v1/users/__tests__/route.test.ts`는 파일 필터가 전달되지 않아 웹 전체 테스트가 실행되며 기존 Spring mock/SEO 테스트 실패가 섞였다. 정확한 대상 파일 명령은 별도로 통과했다.
