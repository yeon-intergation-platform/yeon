#!/usr/bin/env python3
"""Sprite sheet alpha-key tool.

각 셀의 바깥 edge에서 이어진 밝고 저채도인 배경 픽셀만 alpha 0으로 만든다.
전체 색상 치환이 아니라 edge flood-fill 방식이라 sprite 내부 흰 하이라이트는 보존한다.

예시:
  python3 scripts/sprites/alpha-key-sheet.py \
    apps/web/public/slime-game/assets/slime_hero_sheet.png \
    --cols 8 --rows 3 --in-place

  pnpm sprite:alpha-key -- apps/web/public/slime-game/assets/slime_hero_sheet.png \
    --cols 8 --rows 3 --output /tmp/slime_hero_alpha.png
"""

from __future__ import annotations

import argparse
import binascii
import shutil
import struct
import sys
import zlib
from collections import deque
from dataclasses import dataclass
from pathlib import Path

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
SUPPORTED_COLOR_TYPES = {2: "RGB", 6: "RGBA"}


@dataclass(frozen=True)
class PngImage:
    width: int
    height: int
    color_type: int
    pixels: bytearray


@dataclass(frozen=True)
class AlphaKeyResult:
    changed_pixels: int
    total_pixels: int
    output_path: Path | None

    @property
    def changed_percent(self) -> float:
        return self.changed_pixels / self.total_pixels if self.total_pixels else 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "행/열 sprite sheet에서 각 셀 edge와 연결된 밝은 배경만 alpha 0으로 제거한다."
        )
    )
    parser.add_argument("input", type=Path, help="처리할 PNG 경로")
    parser.add_argument("--cols", type=int, required=True, help="시트 열 개수")
    parser.add_argument("--rows", type=int, required=True, help="시트 행 개수")
    parser.add_argument("--output", type=Path, help="결과 PNG 경로")
    parser.add_argument("--in-place", action="store_true", help="입력 PNG를 직접 갱신")
    parser.add_argument(
        "--backup",
        action="store_true",
        help="--in-place 사용 시 <file>.bak 백업 생성",
    )
    parser.add_argument(
        "--light-min",
        type=float,
        default=184,
        help="배경 후보 평균 밝기 하한값 (기본: 184)",
    )
    parser.add_argument(
        "--max-saturation",
        type=float,
        default=58,
        help="배경 후보 RGB max-min 상한값 (기본: 58)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="변경 픽셀 수만 계산하고 파일은 쓰지 않음",
    )
    argv = sys.argv[1:]
    if argv[:1] == ["--"]:
        argv = argv[1:]
    args = parser.parse_args(argv)

    if args.cols <= 0 or args.rows <= 0:
        parser.error("--cols/--rows는 1 이상이어야 합니다.")
    if args.in_place and args.output:
        parser.error("--in-place와 --output은 동시에 사용할 수 없습니다.")
    if not args.in_place and not args.output and not args.dry_run:
        parser.error("파일을 쓰려면 --in-place 또는 --output 중 하나가 필요합니다.")
    return args


def read_chunks(data: bytes) -> list[tuple[bytes, bytes]]:
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("PNG 파일이 아닙니다.")

    pos = len(PNG_SIGNATURE)
    chunks: list[tuple[bytes, bytes]] = []
    while pos < len(data):
        if pos + 8 > len(data):
            raise ValueError("PNG chunk 헤더가 손상되었습니다.")
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        chunk_type = data[pos + 4 : pos + 8]
        chunk_data = data[pos + 8 : pos + 8 + length]
        if len(chunk_data) != length:
            raise ValueError(f"PNG chunk 길이가 손상되었습니다: {chunk_type!r}")
        chunks.append((chunk_type, chunk_data))
        pos += 12 + length
        if chunk_type == b"IEND":
            break
    return chunks


def paeth_predictor(left: int, up: int, up_left: int) -> int:
    estimate = left + up - up_left
    left_distance = abs(estimate - left)
    up_distance = abs(estimate - up)
    up_left_distance = abs(estimate - up_left)
    if left_distance <= up_distance and left_distance <= up_left_distance:
        return left
    if up_distance <= up_left_distance:
        return up
    return up_left


def unfilter_png(raw: bytes, width: int, height: int, bytes_per_pixel: int) -> bytearray:
    stride = width * bytes_per_pixel
    out = bytearray(height * stride)
    src = 0

    for y in range(height):
        filter_type = raw[src]
        src += 1
        row = bytearray(raw[src : src + stride])
        src += stride
        prev_offset = (y - 1) * stride
        current_offset = y * stride

        for x in range(stride):
            left = row[x - bytes_per_pixel] if x >= bytes_per_pixel else 0
            up = out[prev_offset + x] if y else 0
            up_left = out[prev_offset + x - bytes_per_pixel] if y and x >= bytes_per_pixel else 0

            if filter_type == 0:
                value = row[x]
            elif filter_type == 1:
                value = (row[x] + left) & 255
            elif filter_type == 2:
                value = (row[x] + up) & 255
            elif filter_type == 3:
                value = (row[x] + ((left + up) >> 1)) & 255
            elif filter_type == 4:
                value = (row[x] + paeth_predictor(left, up, up_left)) & 255
            else:
                raise ValueError(f"지원하지 않는 PNG filter type: {filter_type}")

            row[x] = value
            out[current_offset + x] = value
    return out


def read_png(path: Path) -> PngImage:
    chunks = read_chunks(path.read_bytes())
    ihdr = next((chunk_data for chunk_type, chunk_data in chunks if chunk_type == b"IHDR"), None)
    if ihdr is None:
        raise ValueError("IHDR chunk가 없습니다.")

    width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(
        ">IIBBBBB", ihdr
    )
    if bit_depth != 8 or color_type not in SUPPORTED_COLOR_TYPES or interlace != 0:
        raise ValueError(
            "지원하지 않는 PNG 형식입니다. "
            f"bit_depth={bit_depth}, color_type={color_type}, interlace={interlace}"
        )
    if compression != 0 or filter_method != 0:
        raise ValueError("지원하지 않는 PNG compression/filter 설정입니다.")

    bytes_per_pixel = 3 if color_type == 2 else 4
    idat = b"".join(chunk_data for chunk_type, chunk_data in chunks if chunk_type == b"IDAT")
    raw = zlib.decompress(idat)
    pixels = unfilter_png(raw, width, height, bytes_per_pixel)

    rgba = bytearray(width * height * 4)
    for i in range(width * height):
        src = i * bytes_per_pixel
        dst = i * 4
        rgba[dst : dst + 3] = pixels[src : src + 3]
        rgba[dst + 3] = pixels[src + 3] if bytes_per_pixel == 4 else 255

    return PngImage(width=width, height=height, color_type=color_type, pixels=rgba)


def make_chunk(chunk_type: bytes, chunk_data: bytes) -> bytes:
    crc = binascii.crc32(chunk_type + chunk_data) & 0xFFFFFFFF
    return struct.pack(">I", len(chunk_data)) + chunk_type + chunk_data + struct.pack(">I", crc)


def write_png_rgba(path: Path, image: PngImage) -> None:
    stride = image.width * 4
    raw_rows = bytearray()
    for y in range(image.height):
        raw_rows.append(0)
        raw_rows.extend(image.pixels[y * stride : (y + 1) * stride])

    ihdr = struct.pack(">IIBBBBB", image.width, image.height, 8, 6, 0, 0, 0)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        PNG_SIGNATURE
        + make_chunk(b"IHDR", ihdr)
        + make_chunk(b"IDAT", zlib.compress(bytes(raw_rows), level=9))
        + make_chunk(b"IEND", b"")
    )


def is_background_candidate(
    red: int,
    green: int,
    blue: int,
    *,
    light_min: float,
    max_saturation: float,
) -> bool:
    high = max(red, green, blue)
    low = min(red, green, blue)
    average = (red + green + blue) / 3
    saturation = high - low
    return average >= light_min and saturation <= max_saturation


def alpha_key_cells(
    image: PngImage,
    *,
    cols: int,
    rows: int,
    light_min: float,
    max_saturation: float,
) -> int:
    changed = 0

    for row in range(rows):
        y0 = round(row * image.height / rows)
        y1 = round((row + 1) * image.height / rows)
        for col in range(cols):
            x0 = round(col * image.width / cols)
            x1 = round((col + 1) * image.width / cols)
            queue: deque[tuple[int, int]] = deque()

            for x in range(x0, x1):
                queue.append((x, y0))
                queue.append((x, y1 - 1))
            for y in range(y0, y1):
                queue.append((x0, y))
                queue.append((x1 - 1, y))

            while queue:
                x, y = queue.popleft()
                if x < x0 or x >= x1 or y < y0 or y >= y1:
                    continue

                offset = (y * image.width + x) * 4
                if image.pixels[offset + 3] == 0:
                    continue

                red, green, blue = image.pixels[offset], image.pixels[offset + 1], image.pixels[offset + 2]
                if not is_background_candidate(
                    red,
                    green,
                    blue,
                    light_min=light_min,
                    max_saturation=max_saturation,
                ):
                    continue

                image.pixels[offset + 3] = 0
                changed += 1
                queue.append((x + 1, y))
                queue.append((x - 1, y))
                queue.append((x, y + 1))
                queue.append((x, y - 1))

    return changed


def run_alpha_key(args: argparse.Namespace) -> AlphaKeyResult:
    input_path = args.input.resolve()
    if not input_path.is_file():
        raise FileNotFoundError(f"입력 파일 없음: {input_path}")

    image = read_png(input_path)
    changed = alpha_key_cells(
        image,
        cols=args.cols,
        rows=args.rows,
        light_min=args.light_min,
        max_saturation=args.max_saturation,
    )

    output_path: Path | None = None
    if not args.dry_run:
        output_path = input_path if args.in_place else args.output.resolve()
        if args.backup and args.in_place:
            backup_path = input_path.with_suffix(input_path.suffix + ".bak")
            shutil.copy2(input_path, backup_path)
        write_png_rgba(output_path, image)

    return AlphaKeyResult(
        changed_pixels=changed,
        total_pixels=image.width * image.height,
        output_path=output_path,
    )


def main() -> int:
    args = parse_args()
    try:
        result = run_alpha_key(args)
    except Exception as exc:  # pragma: no cover
        sys.stderr.write(f"[sprite-alpha-key] 실패: {exc}\n")
        return 1

    action = "dry-run" if args.dry_run else "write"
    output = str(result.output_path) if result.output_path else "-"
    print(
        "[sprite-alpha-key] "
        f"{action} changed={result.changed_pixels}/{result.total_pixels} "
        f"({result.changed_percent:.1%}) output={output}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
