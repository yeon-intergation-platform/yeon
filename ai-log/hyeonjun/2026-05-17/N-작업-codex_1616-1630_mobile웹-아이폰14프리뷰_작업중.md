# 작업 로그 (2026-05-17)

## 주제

모바일 앱 iPhone 14 Pro 규격 기준 웹 미리보기 프레임 고정

## 차수 1

- 작업내용: `apps/mobile/app/_layout.tsx`에서 웹 렌더링 시 모바일 프레임(393x852 기준)으로 중앙 고정되도록 `MobileWebFrame`을 적용해 데스크톱 창에서 앱이 모바일 비율로만 보이도록 수정
- 논의 필요: 없음 (모바일 전용 앱이므로 웹 미리보기 모드 강제는 허용됨)
- 선택지: (1) 뷰포트 자동 스케일 적용, (2) 고정 크기만 적용
- 추천: 뷰포트에 맞춰 393x852 기준 스케일을 적용해 항상 모바일 비율 유지
- 사용자 방향: 미리보기 고정(아이폰14 Pro)

## 검증

- `pnpm --filter @yeon/mobile lint`
- `pnpm --filter @yeon/mobile typecheck`

## 차수 2

- 작업내용: 웹 미리보기 하드코딩(`393`, `852`, 색/보더 값)을 `apps/mobile/src/lib/mobile-preview.ts`로 분리해
  `apps/mobile/app/_layout.tsx`에서는 설정만 소비하도록 리팩터링
- 논의 필요: 프리뷰 사양이 제품 정책에 따라 바뀔 가능성(현재는 iPhone 14 Pro 고정 유지)
- 선택지: (1) `_layout.tsx` 내부 하드코딩 유지, (2) 설정 파일 분리
- 추천: 설정 파일 분리 + 확장 포인트 확보
- 사용자 방향: 유지보수 우선 방식으로 설정 분리

## 검증

- `pnpm --filter @yeon/mobile lint`
- `pnpm --filter @yeon/mobile typecheck`
