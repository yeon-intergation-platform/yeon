# 공개 콘텐츠 본문 블록 렌더링 보강

작성일: 2026-06-17  
대상: `support.yeon.world`, `news.yeon.world`, `blog.yeon.world`  
상위 계획: `docs/product/backlog/2026-06-17-public-content-network-500-step-plan.md`

## 배경

공개 콘텐츠 7차 계획의 168~170번은 이미지, code block, support 단계형 목록 렌더링 품질을 요구한다. 현재 article body 렌더링은 `public-content-ui.tsx` 내부 함수가 직접 처리하고 있어 블록 종류가 늘어날수록 UI 파일 책임이 커진다.

## 1차

### 작업내용

- public content block renderer를 별도 feature component로 분리한다.
- 이미지 블록은 `width`와 `height`를 필수로 두고 aspect ratio를 고정한다.
- code block은 차분한 테두리/배경/가로 스크롤 스타일로 렌더링한다.
- support 문서 단계 목록은 번호와 본문이 더 분명히 구분되도록 보강한다.
- public content audit에서 image/code block 필수값을 검증한다.

### 논의 필요

이미지 자산을 언제 실제 콘텐츠에 넣을지 여부.

### 선택지

- 렌더링 기반만 먼저 추가하고 실제 이미지는 이후 제품 스크린샷 정책이 정해지면 넣는다.
- 지금 임의 이미지를 넣어 렌더링을 즉시 보여준다.
- 이미지 블록을 후순위로 미룬다.

### 추천

렌더링 기반과 audit만 먼저 추가한다. 임의 이미지를 넣으면 SEO/콘텐츠 근거가 약해지므로, 실제 스크린샷 자산 정책을 정한 뒤 콘텐츠에 넣는다.

### 사용자 방향

비어 있으면 추천 기준으로 진행한다.
