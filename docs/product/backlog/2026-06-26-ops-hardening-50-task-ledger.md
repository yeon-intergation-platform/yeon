# 운영누락 보강 50개 태스크 장부

## 1차수

### 작업내용

- 운영에서 조용히 깨질 수 있는 URL, SEO, BFF, catalog, feed, 라우팅, 계약 경계를 50개 태스크로 나눠 점진적으로 테스트/검증/문서화한다.
- 기능 추가가 아니라 기존 동작의 불변식과 운영 절차를 고정한다.
- 완료된 항목은 PR 단위로 체크하고, 각 PR은 검증 후 main에 병합한다.

### 논의 필요

- 없음. 사용자가 운영누락 보강 50개 태스크 진행을 지시했다.

### 선택지

- A. 게임/SEO 운영 표면부터 작은 테스트 보강을 누적한다.
- B. 여러 서비스에 넓게 흩뿌려 동시에 진행한다.

### 추천

- A. 최근 운영 리스크가 확인된 게임/SEO 축에서 이어가면 검증 범위가 작고 누락 방지 효과가 즉시 생긴다.

### 사용자 방향

- 추천 기준으로 진행한다.

## 진행 현황

- 목표: 50개
- 완료: 50개
- 진행 중: 없음

## 태스크 체크리스트

- [x] 1.  게임 region 값 판별 경계 고정
- [x] 2.  국가 코드에서 게임 추천 region 정규화 경계 고정
- [x] 3.  KR 추천 게임 목록이 비어 있지 않음 고정
- [x] 4.  US 추천 게임 목록이 비어 있지 않음 고정
- [x] 5.  global 추천 게임 목록이 비어 있지 않음 고정
- [x] 6.  추천 게임 목록에 없는 slug가 끼지 않음 고정
- [x] 7.  게임 collection 값 판별 경계 고정
- [x] 8.  retro collection이 SWF 게임만 포함함 고정
- [x] 9.  twoPlayer collection 순서/대상 경계 고정
- [x] 10. game hub tab key 중복 방지
- [x] 11. game hub tab label 공백 방지
- [x] 12. game tag 중복 방지
- [x] 13. GameMonetize category trim/lowercase 경계 고정
- [x] 14. GameMonetize soccer/sports 매핑 경계 고정
- [x] 15. GameMonetize multiplayer/io 매핑 경계 고정
- [x] 16. HTML entity invalid numeric 보존 경계 고정
- [x] 17. 알 수 없는 HTML entity 보존 경계 고정
- [x] 18. feed slug 길이 상한 경계 고정
- [x] 19. feed slug 공백/기호 정규화 경계 고정
- [x] 20. feed width/height fallback 경계 고정
- [x] 21. feed 빈 title reject 경계 고정
- [x] 22. feed 빈 id reject 경계 고정
- [x] 23. feed thumb URL reject 경계 고정
- [x] 24. feed limit 유지 경계 고정
- [x] 25. feed revalidate 초 유지 경계 고정
- [x] 26. feed fetch 실패 시 last-good fallback 경계 고정
- [x] 27. feed HTTP 실패 시 last-good fallback 경계 고정
- [x] 28. feed 빈 배열 응답 시 last-good fallback 경계 고정
- [x] 29. feed 성공 후 last-good 갱신 경계 고정
- [x] 30. game source category filter page clamp 경계 고정
- [x] 31. game source collection 우선순위 경계 고정
- [x] 32. game source search trim/null 경계 고정
- [x] 33. game source empty result totalPages 경계 고정
- [x] 34. game source high page clamp 경계 고정
- [x] 35. game detail metadata canonical host 경계 고정
- [x] 36. game detail metadata unknown slug noindex 경계 고정
- [x] 37. game JSON-LD 필수 필드 경계 고정
- [x] 38. game sitemap canonical host 전수 경계 고정
- [x] 39. game robots sitemap host 경계 고정
- [x] 40. service subdomain game rewrite query 보존 경계 고정
- [x] 41. service subdomain game legacy query redirect 경계 고정
- [x] 42. Search Console 제출 dry-run host 목록 경계 고정
- [x] 43. Search Console 문서 host 목록 경계 고정
- [x] 44. BFF game play malformed JSON 경계 고정
- [x] 45. BFF game comments header encoding 경계 고정
- [x] 46. Spring game comments header decoding 경계 고정
- [x] 47. game catalog/feed/source/SEO/route 관련 테스트 묶음 통과 확인
- [x] 48. web lint/typecheck 통과 확인
- [x] 49. project SSOT/Search Console verifier 통과 확인
- [x] 50. 운영누락 보강 장부와 검증 로그 정합성 점검

## 완료 증거

- 01~25: `game-catalog.test.ts`, `game-feed.test.ts`의 catalog/feed 불변식 테스트.
- 26~29: `game-feed-fetch.test.ts`의 last-good fallback 테스트.
- 30~34: `game-source.test.ts`의 filter, collection, query, empty result, page clamp 테스트.
- 35~39: `page.test.ts`, `seo.test.ts`, `sitemap-robots.test.ts`의 metadata/sitemap/robots 테스트.
- 40~41: `subdomain-routing.test.ts`의 game subdomain query 보존 테스트.
- 42~43: `bin/verify-search-console-targets.mjs`와 `bash bin/verify-ssot.sh --project-only`.
- 44~46: game play/comments route/client/backend header 테스트.
- 47~50: 2차 묶음 통합 테스트와 로그/장부 검증.
