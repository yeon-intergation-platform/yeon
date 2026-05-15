# 스프라이트 시트 배경 투명화 공용 툴 작업 로그

## 목표

- 슬라임 에셋에서 사용한 투명 배경 처리 방식을 재사용 가능한 공용 CLI로 만든다.
- 새 의존성 없이 sprite sheet의 셀 edge-connected 밝은 배경만 alpha 0으로 제거한다.

## 진행

- 백로그 작성 완료.
- `scripts/sprites/alpha-key-sheet.py` 추가.
  - Python 표준 라이브러리만 사용.
  - PNG RGB/RGBA 입력 지원.
  - 셀 edge flood-fill 방식으로 배경 후보만 제거.
  - `--in-place`, `--output`, `--dry-run`, `--backup`, threshold 옵션 지원.
- `pnpm sprite:alpha-key` root script 추가.
- `scripts/sprites/README.md`에 사용법 문서화.

## 검증

- `python3 -m py_compile scripts/sprites/alpha-key-sheet.py` 성공.
- `pnpm sprite:alpha-key -- /tmp/slime_hero_pre_alpha.png --cols 8 --rows 3 --output /tmp/slime_hero_tool_alpha.png` 성공.
  - RGB 원본 임시 파일 기준 `1172904/1572516 (74.6%)` 픽셀 alpha 제거.
  - 결과 파일 RGBA PNG 확인.
- `pnpm sprite:alpha-key -- apps/web/public/slime-game/assets/slime_hero_sheet.png --cols 8 --rows 3 --dry-run` 성공.
  - 현재 에셋은 이미 처리되어 `0/1572516 (0.0%)` 확인.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web build` 성공.
