"""
타자연습 캐릭터 스프라이트 정규화 도구.

원본 chibi 스프라이트시트(9행×8열, 셀 192×208)에서
2번째 줄(오른쪽 달리기 8프레임)을 잘라 표준 시트로 출력한다.

사용:
  python3 scripts/sprites/extract-character-run.py

manifest는 이 파일 하단의 CHARACTERS 리스트에 추가한다.
새 캐릭터 추가 시 src 경로/타깃 id/플립 여부만 적으면 끝.

요구사항: PIL(Pillow). 시스템 Python에 없으면 venv에서 실행:
  python3 -m venv /tmp/pil-venv && /tmp/pil-venv/bin/pip install Pillow
  /tmp/pil-venv/bin/python scripts/sprites/extract-character-run.py
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:  # pragma: no cover
    sys.stderr.write(
        "Pillow가 필요합니다. /tmp/pil-venv/bin/python으로 실행하세요.\n"
    )
    raise SystemExit(1) from exc


# 원본 시트 layout: 9행 × 8열, 셀 너비 = 시트 폭 / 8
RUN_ROW_INDEX = 1   # 2번째 줄 (오른쪽 달리기)
ROW_COUNT = 9
COL_COUNT = 8


def extract_run_row(src: Path, dst: Path, *, flip_horizontal: bool = False) -> tuple[int, int]:
    """src 시트의 RUN_ROW를 8프레임 단일 PNG로 추출하면서 정규화한다.

    정규화 절차:
      1) 각 셀에서 캐릭터 alpha bbox 검출.
      2) 모든 프레임의 가로 중심을 셀 가로 중심에 정렬.
      3) 모든 프레임의 발 baseline(bbox 하단)을 셀 바닥에 정렬.
      4) 가로폭 변동에 따른 좌우 흔들림 시각효과를 줄이기 위해 위 정렬을 강제.

    반환: (frame_width, frame_height) — registry 메타에 그대로 기록.
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
        if bbox is None:
            # 빈 셀은 그대로 둠.
            target_index = COL_COUNT - 1 - c if flip_horizontal else c
            out.paste(cell, (target_index * cell_w, 0))
            continue
        l, t, r, b = bbox
        char = cell.crop(bbox)
        char_w = r - l
        char_h = b - t
        # 가로 중심 = 셀 가로 중심, 세로 baseline = 셀 바닥.
        target_x = (cell_w - char_w) // 2
        target_y = cell_h - char_h
        normalized = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
        normalized.paste(char, (target_x, target_y))
        target_index = COL_COUNT - 1 - c if flip_horizontal else c
        out.paste(normalized, (target_index * cell_w, 0))

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, format="PNG")
    return cell_w, cell_h


# 새 캐릭터 추가 시 여기에 한 줄 추가하면 끝.
CHARACTERS = [
    {
        "id": "asuna",
        "src": "/home/osuma/OneDrive-Linux/Downloads/spritesheet.webp",
        "dst": "apps/web/public/sprites/characters/asuna/run.png",
        "flip": False,  # row1이 이미 RIGHT facing
    },
    {
        "id": "linnea",
        "src": "/home/osuma/OneDrive-Linux/Downloads/pet/spritesheet.webp",
        "dst": "apps/web/public/sprites/characters/linnea/run.png",
        "flip": False,
    },
]


def main() -> int:
    repo_root = Path(__file__).resolve().parents[2]
    print(f"repo_root = {repo_root}")
    for entry in CHARACTERS:
        src = Path(entry["src"])
        dst = repo_root / entry["dst"]
        if not src.is_file():
            print(f"  [skip] {entry['id']}: src 없음 ({src})")
            continue
        fw, fh = extract_run_row(src, dst, flip_horizontal=entry["flip"])
        print(f"  [ok]   {entry['id']}: {dst.relative_to(repo_root)}  frame={fw}x{fh} count=8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
