# 공개 콘텐츠 Audit CI 연동

작성일: 2026-06-17  
대상: `.github/workflows/frontend-quality.yml`  
범위: 공개 콘텐츠 registry 품질 검사 자동화. 상담 워크스페이스는 제외한다.

## 차수

### 26차: frontend quality gate에 공개 콘텐츠 audit 추가

작업내용:

1. 기존 `frontend-quality.yml`의 web 검증 흐름을 확인한다.
2. `pnpm --filter @yeon/web public-content:audit` step을 추가한다.
3. 새 step은 web 테스트 근처에 두어 공개 콘텐츠 registry 변경 시 함께 실패하게 한다.
4. GitHub API 폴링 없이 로컬 검증으로 workflow YAML만 확인한다.

논의 필요:

- audit를 모든 frontend 변경에서 실행할지, public-content 경로 변경 때만 실행할지.

선택지:

- 모든 frontend quality run에서 실행, 별도 path filter workflow, 수동 스크립트만 유지.

추천:

- audit가 가볍기 때문에 모든 frontend quality run에서 실행한다.

사용자 방향:

- 비어 있으면 추천 기준으로 진행한다.
