# news 목록 필터와 detail 필수 섹션

- 시작: 18:36
- 작업 워크트리: `yeon-2`
- 브랜치: `feat/news-list-detail-structure-20260617`
- 목표: `news.yeon.world`의 공지/업데이트 서비스 필터, 업계 뉴스 주제 필터, news detail 필수 섹션을 구현한다.
- 상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md` 9차 211~219
- 검증 예정: public-content data/navigation/news detail 테스트, public-content audit, web typecheck/lint/build, Playwright

## 진행

- `news/news/{topic}` collection을 서비스가 아닌 주제 필터로 해석하도록 데이터 파생 로직을 조정했다.
- news detail category별 필수 섹션 모델/뷰를 추가했다.
- audit가 news detail 섹션, updates 관련 support 링크, 업계 뉴스 관련 blog 링크를 검사하도록 보강했다.

## 결과

- 상위 계획 9차 211~219 완료 표시.
- `/news/notice`, `/news/updates`, `/news/news`, `/news/news/ai`, `/news/updates/card/support-guides`, `/news/news/ai/discord-ai-news-interpretation` desktop/mobile Playwright 확인 완료.
- 검증: public-content 테스트 15개, public-content audit 36개, web typecheck/lint/build, diff check, skill sync, project SSOT.
