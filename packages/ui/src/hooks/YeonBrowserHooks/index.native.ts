export function useYeonBodyScrollLock(_enabled = true) {
  return undefined;
}

export function useYeonBodyClass(_className: string, _enabled = true) {
  return undefined;
}

export function addYeonDocumentEventListener(
  _type: string,
  _listener: (event: unknown) => void
) {
  return () => undefined;
}

export function useYeonDocumentEvent(
  _type: string,
  _listener: (event: unknown) => void,
  _enabled = true
) {
  return undefined;
}

export function useYeonWindowEvent(
  _type: string,
  _listener: (event: unknown) => void,
  _enabled = true,
  _options?: boolean | unknown
) {
  return undefined;
}

export function useYeonEscapeKey(_onEscape: () => void, _enabled = true) {
  return undefined;
}
