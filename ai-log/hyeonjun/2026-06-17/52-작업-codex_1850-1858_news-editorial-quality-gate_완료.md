# news editorial 품질 게이트

- 시작: 18:50
- 작업 워크트리: `yeon-3`
- 브랜치: `feat/news-editorial-quality-20260617`
- 목표: 공개 콘텐츠 500단계 9차 220~225를 구현한다.
- 범위: 업계 뉴스 출처 링크, 원문 복사/과장/보도자료 톤 audit, 긴 공지 목차 완료 표시.
- 검증 예정: public-content editorial/test/audit, web typecheck/lint/build, Playwright news detail 확인.

## 결과

- 공개 본문 `links` block을 추가하고 Discord 공식 문서 출처 링크를 업계 뉴스 해설 글에 표시했다.
- news editorial warning 모델과 audit 연결을 추가했다.
- 500단계 원장 220~225 완료 표시.
- 검증: editorial/TOC/detail 테스트 10개, public-content audit 36개, web typecheck/lint/build, diff check, skill sync, project SSOT.
- Playwright: `/news/news/ai/discord-ai-news-interpretation` desktop/mobile 200, `참고 출처` 링크 1개, overflow 없음.
