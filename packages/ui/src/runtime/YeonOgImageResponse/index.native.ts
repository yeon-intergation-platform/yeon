export type YeonOgImageResponseElement = unknown;
export type YeonOgImageResponseOptions = {
  height?: number;
  width?: number;
};

export function createYeonOgImageResponse(
  _element: YeonOgImageResponseElement,
  _options?: YeonOgImageResponseOptions
): never {
  throw new Error(
    "Yeon OG image response is only available on the web runtime."
  );
}
