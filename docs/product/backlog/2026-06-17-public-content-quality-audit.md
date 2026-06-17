# 공개 콘텐츠 품질 Audit 스크립트

작성일: 2026-06-17  
대상: `apps/web/src/features/public-content/public-content-data.ts`  
범위: 정적 공개 콘텐츠 registry 품질 검사. 상담 워크스페이스는 제외한다.

## 차수

### 25차: 발행 전 품질 audit 자동화

작업내용:

1. 현재 정적 공개 콘텐츠 registry를 읽는 audit 스크립트를 만든다.
2. title, description, summary, slug, source path, body block 기본 품질을 검사한다.
3. 빈 heading, 빈 checklist/steps/callout을 실패 처리한다.
4. source path가 없는 글을 실패 처리한다.
5. 외부 링크만 있고 자체 설명이 없는 경우를 경고 또는 실패 후보로 둔다.
6. web package script로 실행할 수 있게 한다.

논의 필요:

- 경고를 CI 실패로 볼지, 실패와 경고를 분리할지.

선택지:

- 전부 실패, 실패/경고 분리, 출력만.

추천:

- 현재는 확실한 품질 위반만 실패로 처리하고 애매한 항목은 후속 강화 대상으로 둔다.

사용자 방향:

- 비어 있으면 추천 기준으로 진행한다.
