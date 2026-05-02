"""
타자연습 캐릭터 스프라이트 정규화 도구.

데이터 SoT는 `apps/web/src/features/typing-service/characters/data/<id>.json` 이다.
JSON 의 `extract` 필드가 정의된 캐릭터만 처리한다.

- 원본 시트 위치: `scripts/sprites/raw/<rawSheet>` (사용자가 외부에서 받아온 시트를 여기 복사한다)
- 결과 PNG 위치: data 의 `sprite` 필드를 절대 web 경로로 보고 `apps/web/public` + sprite 로 도출
- 정규화: 9행×8열 layout 가정 → 2번째 줄(우측 달리기 8프레임)을 letterbox 정렬해 출력

요구사항: PIL(Pillow). venv 사용 시:
  /tmp/pil-venv/bin/python scripts/sprites/extract-character-run.py [--id <character-id>]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.stderr.write(
        "Pillow가 필요합니다. /tmp/pil-venv/bin/python으로 실행하세요.\n"
    )
    raise SystemExit(1) from exc


REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = REPO_ROOT / "apps/web/src/features/typing-service/characters/data"
RAW_DIR = REPO_ROOT / "scripts/sprites/raw"
PUBLIC_ROOT = REPO_ROOT / "apps/web/public"

# 원본 시트 layout: 9행 × 8열
RUN_ROW_INDEX = 1
ROW_COUNT = 9
COL_COUNT = 8


def public_path_for(sprite: str) -> Path:
    if not sprite.startswith("/"):
        raise ValueError(
            f"sprite path must be absolute web path (예: /sprites/...): {sprite}"
        )
    return PUBLIC_ROOT / sprite.lstrip("/")


def extract_run_row(src: Path, dst: Path, *, flip_horizontal: bool = False) -> tuple[int, int]:
    """src 시트의 RUN_ROW를 8프레임 단일 PNG로 추출하면서 정규화한다.

    정규화 절차:
      1) 각 셀에서 캐릭터 alpha bbox 검출.
      2) 모든 프레임의 가로 중심을 셀 가로 중심에 정렬.
      3) 모든 프레임의 발 baseline(bbox 하단)을 셀 바닥에 정렬.

    반환: (frame_width, frame_height)
    """
    sheet = Image.open(src).convert("RGBA")
    sheet_w, sheet_h = sheet.size
    if sheet_w % COL_COUNT != 0 or sheet_h % ROW_COUNT != 0:
        raise ValueError(
            f"{src.name}: {sheet_w}x{sheet_h} 가 {ROW_COUNT}행x{COL_COUNT}열로 "
            "균등하게 나누어지지 않습니다. 원본 layout을 다시 확인하세요."
        )

    cell_w = sheet_w // COL_COUNT
    cell_h = sheet_h // ROW_COUNT
    top = RUN_ROW_INDEX * cell_h
    row_img = sheet.crop((0, top, sheet_w, top + cell_h))

    out = Image.new("RGBA", (sheet_w, cell_h), (0, 0, 0, 0))
    for c in range(COL_COUNT):
        cell = row_img.crop((c * cell_w, 0, (c + 1) * cell_w, cell_h))
        if flip_horizontal:
            cell = cell.transpose(Image.FLIP_LEFT_RIGHT)
        bbox = cell.split()[-1].getbbox()
        target_index = COL_COUNT - 1 - c if flip_horizontal else c
        if bbox is None:
            out.paste(cell, (target_index * cell_w, 0))
            continue
        l, t, r, b = bbox
        char = cell.crop(bbox)
        char_w = r - l
        char_h = b - t
        target_x = (cell_w - char_w) // 2
        target_y = cell_h - char_h
        normalized = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
        normalized.paste(char, (target_x, target_y))
        out.paste(normalized, (target_index * cell_w, 0))

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, format="PNG")
    return cell_w, cell_h


def load_extract_jobs(only_id: str | None) -> list[dict]:
    if not DATA_DIR.is_dir():
        raise SystemExit(f"data 디렉토리 없음: {DATA_DIR}")
    jobs: list[dict] = []
    for json_path in sorted(DATA_DIR.glob("*.json")):
        meta = json.loads(json_path.read_text(encoding="utf-8"))
        if only_id and meta.get("id") != only_id:
            continue
        if not meta.get("extract"):
            continue
        jobs.append(meta)
    return jobs


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", help="특정 캐릭터 id만 추출")
    args = parser.parse_args()

    jobs = load_extract_jobs(args.id)
    if not jobs:
        print("처리 대상 없음 (data/*.json 의 extract 필드를 확인하세요).")
        return 0

    for meta in jobs:
        cid = meta["id"]
        ext = meta["extract"]
        src = RAW_DIR / ext["rawSheet"]
        dst = public_path_for(meta["sprite"])
        if not src.is_file():
            print(f"  [skip] {cid}: 원본 시트 없음 → {src.relative_to(REPO_ROOT)}")
            continue
        fw, fh = extract_run_row(src, dst, flip_horizontal=bool(ext.get("flip")))
        print(
            f"  [ok]   {cid}: {dst.relative_to(REPO_ROOT)}  frame={fw}x{fh} count={COL_COUNT}",
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
