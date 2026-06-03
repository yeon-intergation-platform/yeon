import { isYeonBlob, type YeonBlob } from "../YeonBrowserRuntime";

export type YeonHeicImageConversionOptions = {
  blob: YeonBlob;
  quality?: number;
  toType?: "image/jpeg";
};

export async function convertYeonHeicImageBlobToJpegBlob({
  blob,
  quality = 0.92,
  toType = "image/jpeg",
}: YeonHeicImageConversionOptions) {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob, toType, quality });
  const convertedBlob = Array.isArray(converted) ? converted[0] : converted;

  return isYeonBlob(convertedBlob) ? convertedBlob : null;
}
