# 작업 로그: typing-service rooms/decks sitemap 직접 등록

## 작업내용

- `apps/web/src/lib/seo.ts`의 `INDEXABLE_SITEMAP_ENTRIES`에
  `/typing-service/rooms`, `/typing-service/decks` 항목을 추가해 sitemap 생성 대상에 직접 노출되도록 반영했습니다.
- 변경 우선순위는 `0.85`, 변경 주기는 `daily`로 설정했습니다.

## 사용자 방향

- 명시적으로 반영 요청한 두 URL의 sitemap 노출을 우선 수행.

## 검증

- `pnpm --filter @yeon/web build` 실행 후 통과 확인
