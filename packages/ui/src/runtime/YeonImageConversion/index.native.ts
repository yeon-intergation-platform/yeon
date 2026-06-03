import type { YeonBlob } from "../YeonBrowserRuntime/index.native";

export type YeonHeicImageConversionOptions = {
  blob: YeonBlob;
  quality?: number;
  toType?: "image/jpeg";
};

export async function convertYeonHeicImageBlobToJpegBlob(
  _options: YeonHeicImageConversionOptions
) {
  return null;
}
