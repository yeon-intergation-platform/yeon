# 스프라이트 샘플 component 분해 수정 작업 로그

- 시작: 2026-05-15 KST
- 완료: 2026-05-15 KST
- 목표: `/sprite-editor` 샘플 프레임 1~16이 모두 잘리거나 인접 프레임이 섞이는 문제 수정
- 원인: 전체 콘텐츠 영역을 균등 16등분해서 포즈별 실제 폭과 간격을 반영하지 못함

## 구현 결과

- 체크무늬 배경을 제외한 실제 캐릭터 픽셀 판별 함수를 추가했다.
- column 단위 콘텐츠 range를 찾고, range가 16개를 넘으면 가장 가까운 gap부터 병합해 16개 프레임 component로 만든다.
- 각 component의 실제 x/y/w/h bounds를 다시 계산한 뒤 개별 crop/padding/fit을 적용해 샘플 프레임을 생성한다.
- 4x4 분할 또는 전체 영역 균등 16등분이 아니라, 샘플 이미지 안의 실제 16개 캐릭터 덩어리를 기준으로 자른다.

## 검증

- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `git diff --check`
- `pnpm --filter @yeon/web build`
