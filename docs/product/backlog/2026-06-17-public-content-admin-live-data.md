# 공개 콘텐츠 admin 실데이터 대시보드 연결

작성일: 2026-06-17
대상: `apps/web` 공개 콘텐츠 admin 화면
범위: `/admin/content`, `/admin/content/[channel]` 읽기 전용 화면 데이터

## 1차: Spring admin read API 기반 화면 전환

논의 필요: admin 화면에서 정적 registry와 Spring admin data 중 무엇을 우선할지.
선택지: 정적 registry 유지, Spring admin data 우선, 둘 다 병합.
추천: Spring admin data를 우선한다. 정적 registry는 테스트와 fallback 계산용 함수로만 유지한다.
사용자 방향: 비어 있으면 추천 기준으로 진행한다.

작업내용:

1. admin 모델에 Spring admin article DTO 배열을 입력받는 dashboard builder를 추가한다.
2. status, visibility, noindex, meta description, canonical 경고를 admin 통계로 계산한다.
3. `/admin/content` 페이지에서 Spring admin 목록과 channel sitemap을 읽어 화면에 넘긴다.
4. `/admin/content/[channel]` 페이지에서 channel별 Spring admin 목록과 sitemap을 읽어 화면에 넘긴다.
5. 화면 컴포넌트는 read-only props 렌더링만 담당하게 한다.
6. Spring 호출 실패 시 수정/삭제 UI 없이 오류 안내 화면을 보여준다.
7. 기존 정적 registry 테스트를 유지하고, Spring DTO 기반 계산 테스트를 추가한다.
