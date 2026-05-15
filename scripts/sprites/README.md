# Sprite tools

## `alpha-key-sheet.py`

행/열 기반 PNG sprite sheet에서 각 셀의 바깥 edge와 연결된 밝고 저채도인 배경만 alpha 0으로 제거한다.
전체 색상 치환이 아니라 edge flood-fill 방식이라 캐릭터 내부 흰 하이라이트는 보존한다.

```bash
python3 scripts/sprites/alpha-key-sheet.py \
  apps/web/public/slime-game/assets/slime_hero_sheet.png \
  --cols 8 \
  --rows 3 \
  --in-place
```

root package script로도 실행할 수 있다.

```bash
pnpm sprite:alpha-key -- \
  apps/web/public/slime-game/assets/slime_hero_sheet.png \
  --cols 8 \
  --rows 3 \
  --output /tmp/slime_hero_alpha.png
```

주요 옵션:

- `--in-place`: 입력 PNG를 직접 갱신한다.
- `--output <path>`: 결과 PNG를 별도 경로로 저장한다.
- `--dry-run`: 변경 픽셀 수만 계산한다.
- `--light-min`: 배경 후보 평균 밝기 하한값. 기본값은 `184`.
- `--max-saturation`: 배경 후보 RGB max-min 상한값. 기본값은 `58`.
- `--backup`: `--in-place` 사용 시 `<file>.png.bak` 백업을 만든다.
