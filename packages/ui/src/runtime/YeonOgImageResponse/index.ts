import { ImageResponse } from "next/og";

export type YeonOgImageResponseElement = ConstructorParameters<
  typeof ImageResponse
>[0];
export type YeonOgImageResponseOptions = ConstructorParameters<
  typeof ImageResponse
>[1];

export function createYeonOgImageResponse(
  element: YeonOgImageResponseElement,
  options?: YeonOgImageResponseOptions
) {
  return new ImageResponse(element, options);
}
