# 스프라이트 시트 배경 투명화 공용 툴 백로그 (2026-05-16)

## 1차

### 작업내용

- 슬라임 시트에서 사용한 edge-connected 밝은 배경 제거 방식을 `scripts/sprites` 하위 공용 CLI로 분리한다.
- 행/열 기반 sprite sheet에 대해 셀 경계에서 이어진 밝고 저채도인 배경만 alpha 0으로 바꿀 수 있게 한다.
- in-place 처리와 별도 output 저장을 모두 지원한다.
- root package script로 쉽게 실행할 수 있게 연결한다.
- 슬라임 에셋은 새 공용 툴로도 동일 처리가 가능함을 검증한다.

### 논의 필요

- 내부 하이라이트까지 지우면 sprite가 훼손되므로, 전체 색상 키잉이 아니라 각 셀 edge에서 flood-fill로 연결된 배경만 제거해야 한다.

### 선택지

- A. Python 표준 라이브러리만 사용하는 독립 CLI를 추가한다.
- B. Pillow/sharp 같은 이미지 처리 의존성을 추가한다.

### 추천

- A. 현재 저장소에 이미지 처리 의존성이 없고, 에이전트/CI에서 추가 설치 없이 실행 가능한 공용 툴이 더 안전하다.

### 사용자 방향

- A 기준으로 진행. 이번에는 툴 공용화만 하고 새 게임 기능은 추가하지 않는다.

## 완료 기록

- `scripts/sprites/alpha-key-sheet.py` 공용 CLI를 추가했다.
- PNG RGB/RGBA 읽기, PNG filter 해제, RGBA 재저장을 Python 표준 라이브러리로 처리한다.
- `--cols`, `--rows`, `--in-place`, `--output`, `--dry-run`, `--backup`, `--light-min`, `--max-saturation` 옵션을 지원한다.
- `pnpm sprite:alpha-key -- ...` root script를 추가했다.
- `scripts/sprites/README.md`에 사용법과 옵션을 문서화했다.

## 검증

- `python3 -m py_compile scripts/sprites/alpha-key-sheet.py`
- `pnpm sprite:alpha-key -- /tmp/slime_hero_pre_alpha.png --cols 8 --rows 3 --output /tmp/slime_hero_tool_alpha.png`
  - RGB 원본 임시 파일에서 `1172904/1572516 (74.6%)` 픽셀 alpha 제거 확인
  - 결과 파일 RGBA PNG 확인
- `pnpm sprite:alpha-key -- apps/web/public/slime-game/assets/slime_hero_sheet.png --cols 8 --rows 3 --dry-run`
  - 현재 에셋은 이미 처리되어 `0/1572516 (0.0%)` 확인
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web build`
