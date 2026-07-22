# Discord AI·게임 프레임브레이크 전경 적용

- 작업자: codex
- 상태: 완료
- 시작: 2026-07-22 21:15 KST
- 종료: 2026-07-22 21:28 KST
- 대상: `/` 랜딩 6번 Discord AI 어시스턴트, 8번 게임 카드
- 백로그: `docs/product/backlog/2026-07-22-landing-frame-break-service-card-21.md`

## 수정 방향

- imagegen 편집 모드로 두 원본을 와이드 크로마키 전경으로 재구성한다.
- 공식 크로마 제거 도구로 투명 WebP를 만들고 알파 채널과 모서리를 검증한다.
- 기존 공용 배경과 다른 카드 에셋은 변경하지 않는다.

## 이미지 제작

- built-in imagegen 편집 모드로 각 제공 원본의 인물 정체성·전등·핵심 서비스 소품을 유지했다.
- 게임 프롬프트 방향: 좌측 게임 모니터, 중앙 전등, 우측 인물·의자, 하단 15~20%의 얇은 책상선, 모든 외곽 여백 확보.
- Discord 프롬프트 방향: 좌측 모니터·전등, 중앙 Discord 어시스턴트 패널, 우측 인물·의자와 보조 알림 패널, 소품 단순화.
- 두 출력 모두 단색 `#00ff00` 크로마키로 생성한 뒤 공식 `remove_chroma_key.py`의 auto-key·soft matte·despill로 투명 전경을 만들었다.
- 최종 에셋:
  - `apps/web/public/images/landing/discord-ai-frame-break-foreground-v1.webp` — 1921×786
  - `apps/web/public/images/landing/game-frame-break-foreground-v1.webp` — 1762×766

## 카드 적용

- 6번과 8번에 투명 전경 메타데이터를 연결했다.
- 두 카드의 장면 폭을 고려해 `w-[min(185%,38rem)]`로 약 9% 확대했다.
- `-bottom-6` 위치로 제목 안전 여백과 머리·전등 돌출을 함께 확보했다.
- 기존 공용 배경은 수정하지 않았다.

## 시각 증거

- `landing-discord-game-frame-break-screenshots/after-375.png`
- `landing-discord-game-frame-break-screenshots/after-1040.png`
- `landing-discord-game-frame-break-screenshots/after-1440.png`

## 검증

- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm verify:parity` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
- `pnpm --filter @yeon/web build` 통과
- Playwright 375px·1040px·1440px: 공용 배경 9개, 전경 8개, 가로 overflow 0 확인
