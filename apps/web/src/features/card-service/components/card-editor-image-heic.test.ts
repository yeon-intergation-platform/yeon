import { beforeEach, describe, expect, it, vi } from "vitest";
import { createYeonFile } from "@yeon/ui/runtime/YeonBrowserRuntime";

const { convertYeonHeicImageBlobToJpegBlob } = vi.hoisted(() => ({
  convertYeonHeicImageBlobToJpegBlob: vi.fn(),
}));

vi.mock("@yeon/ui/runtime/YeonImageConversion", () => ({
  convertYeonHeicImageBlobToJpegBlob,
}));

describe("normalizeCardEditorImageFileForUpload HEIC", () => {
  beforeEach(() => {
    convertYeonHeicImageBlobToJpegBlob.mockReset();
  });

  it("HEIC 변환 실패 원인 예외를 cause로 보존한다", async () => {
    const cause = new Error("decoder unavailable");
    convertYeonHeicImageBlobToJpegBlob.mockRejectedValue(cause);
    const { normalizeCardEditorImageFileForUpload } =
      await import("./card-editor-image-utils");
    const heicHeader = new Uint8Array([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63,
      0x00, 0x00, 0x00, 0x00,
    ]);
    const file = createYeonFile([heicHeader], "sample.heic", {
      type: "image/heic",
    });

    await expect(
      normalizeCardEditorImageFileForUpload(file)
    ).rejects.toMatchObject({
      message:
        "HEIC/HEIF 이미지를 처리하지 못했습니다. 다른 이미지로 다시 시도해 주세요.",
      cause,
    });
  });
});
