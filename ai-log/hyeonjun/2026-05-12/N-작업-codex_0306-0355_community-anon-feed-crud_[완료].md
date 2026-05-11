# 작업 로그: /community 익명 글/댓글 CRUD 지원

## 작업내용

- `/community` 익명 진입 플로우에 닉네임/비밀번호 기반 글·댓글 CRUD 기능 추가
- `/api/v1/chat-service/feed` 계열 API를 비로그인 목록 조회 및 익명 작성자 기반 작성/수정/삭제 구조로 확장
- 글 작성/수정/삭제, 댓글 작성/삭제 UI와 상태관리를 `/community` 페이지에 연결
- 댓글 수정은 사용자 방향대로 제공하지 않음

## 논의 필요

- 현재 익명 권한 검증은 닉네임+비밀번호 조합을 내부 임시 프로필로 매핑하는 방식이다. 추후 운영 보안 수준을 높일 때는 별도 익명 작성자 테이블/비밀번호 해시 컬럼으로 분리할 수 있다.

## 선택지

- 옵션 A (진행): 닉네임+비밀번호를 기반으로 임시 작성자 프로필을 동적으로 매핑하고 기존 feed DB 스키마 기반으로 owner 검증
- 옵션 B: feed와 분리한 별도 익명 토큰 테이블/암호화를 둬 더 엄격한 비밀번호 분리 관리 도입
- 옵션 C: 익명은 작성만 허용하고 수정/삭제는 로그인 전용으로 제한

## 사용자 방향

- 현재 요청 기준으로 옵션 A 진행

## 검증

- `pnpm --filter @yeon/web test 'src/app/api/v1/chat-service/feed/__tests__/route.test.ts' 'src/app/api/v1/chat-service/feed/[postId]/replies/__tests__/route.test.ts'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/api-contract typecheck` 통과
- `pnpm --filter @yeon/web exec eslint ...변경 파일...` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `pnpm --filter @yeon/web lint`는 기존 unrelated lint 오류로 실패

## 상태

- 완료
