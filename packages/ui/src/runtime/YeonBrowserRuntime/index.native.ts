import {
  Alert,
  Platform,
  StyleSheet,
  useWindowDimensions as useReactNativeWindowDimensions,
  type AlertButton,
  type GestureResponderEvent,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

export type YeonBrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};
export type YeonBlob = Blob;
export type YeonBodyInit = BodyInit;
export type YeonAudioElement = null;
export type YeonAnchorElement = null;
export type YeonCanvasElement = null;
export type YeonCanvasRenderingContext2D = null;
export type YeonImageElement = null;
export type YeonInputElement = null;
export type YeonDocumentReadyState = null;
export type YeonClipboardItem = ClipboardItem;
export type YeonDataTransfer = DataTransfer;
export type YeonFetchInput = RequestInfo | URL;
export type YeonRequestInit = RequestInit;
export type YeonRequest = Request;
export type YeonHeadersInit = HeadersInit;
export type YeonHeaders = Headers;
export type YeonFile = File;
export type YeonFormData = FormData;
export type YeonResponse = Response;
export type YeonMediaStream = unknown;
export type YeonRtcConfiguration = unknown;
export type YeonRtcIceCandidateInit = unknown;
export type YeonRtcIceServer = unknown;
export type YeonRtcPeerConnection = null;
export type YeonUrl = URL;
export type YeonUrlSearchParams = URLSearchParams;
export type YeonUrlSearchParamsInit =
  | string
  | Record<string, string>
  | readonly (readonly [string, string])[]
  | URLSearchParams;

export type YeonLoopingAudioSnapshot = {
  playing: boolean;
  blocked: boolean;
};

type YeonLoopingAudioListener = () => void;

export type YeonLoopingAudioController = {
  getSnapshot: () => YeonLoopingAudioSnapshot;
  getServerSnapshot: () => YeonLoopingAudioSnapshot;
  subscribe: (listener: YeonLoopingAudioListener) => () => void;
  toggle: () => Promise<void>;
};

export type YeonLoopingAudioOptions = {
  src: string;
  volume?: number;
};

type YeonRuntimeGlobal = typeof globalThis & {
  __yeonRuntimeSingletons?: Map<string, unknown>;
};

export type YeonAlertButton = {
  onPress?: () => void;
  style?: AlertButton["style"];
  text?: string;
};

export type YeonGestureResponderEvent = GestureResponderEvent;
export type YeonPlatformOS = typeof Platform.OS;
export type YeonStyleProp<T> = StyleProp<T>;
export type YeonTextStyle = TextStyle;
export type YeonViewStyle = ViewStyle;
export type YeonGtagFunction = (...args: unknown[]) => void;
export type YeonWindowErrorHandler = (
  message?: unknown,
  source?: unknown,
  lineNumber?: number,
  columnNumber?: number,
  error?: Error
) => boolean | null | undefined;
export type YeonWindowErrorMessage = unknown;
export type YeonWindowErrorSource = unknown;

export const createYeonStyleSheet: typeof StyleSheet.create = StyleSheet.create;
export const yeonAbsoluteFillObject = StyleSheet.absoluteFillObject;

export function getYeonPlatformOS(): YeonPlatformOS {
  return Platform.OS;
}

export function isYeonIOS() {
  return Platform.OS === "ios";
}

export function isYeonWebPlatform() {
  return Platform.OS === "web";
}

export const useYeonWindowDimensions = useReactNativeWindowDimensions;

const STOPPED_LOOPING_AUDIO_SNAPSHOT: YeonLoopingAudioSnapshot = {
  playing: false,
  blocked: false,
};

const noopStorage: YeonBrowserStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export function getYeonLocalStorage() {
  return noopStorage;
}

export function getYeonOptionalLocalStorage() {
  if (!isYeonWebPlatform()) {
    return null;
  }

  try {
    return typeof globalThis.localStorage === "undefined"
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
}

export function getYeonSessionStorage() {
  return noopStorage;
}

export function readYeonLocalStorageItem(_key: string) {
  return null;
}

export function writeYeonLocalStorageItem(_key: string, _value: string) {
  return undefined;
}

export function removeYeonLocalStorageItem(_key: string) {
  return undefined;
}

export function readYeonSessionStorageItem(_key: string) {
  return null;
}

export function writeYeonSessionStorageItem(_key: string, _value: string) {
  return undefined;
}

export function removeYeonSessionStorageItem(_key: string) {
  return undefined;
}

export function dispatchYeonWindowCustomEvent<TDetail>(
  _type: string,
  _detail: TDetail
) {
  return undefined;
}

export function addYeonWindowEventListener(
  _type: string,
  _listener: (event: Event) => void,
  _options?: boolean | AddEventListenerOptions
) {
  return () => undefined;
}

export function getYeonCustomEventDetail<TDetail>(
  event: Event | { detail?: TDetail }
) {
  if (!("detail" in event)) {
    return null;
  }

  return event.detail ?? null;
}

export function matchYeonMedia(_query: string) {
  return null;
}

export function sendYeonBeacon(_path: string, _payload: unknown) {
  return false;
}

export function fetchYeon(input: YeonFetchInput, init?: YeonRequestInit) {
  return fetch(input, init);
}

export function createYeonHeaders(init?: YeonHeadersInit) {
  return new Headers(init);
}

export function createYeonResponse(
  body?: YeonBodyInit | null,
  init?: ResponseInit
) {
  return new Response(body, init);
}

export function createYeonRtcPeerConnection(_configuration?: unknown) {
  return null;
}

export function hasYeonUserMediaSupport() {
  return false;
}

export function requestYeonUserMedia(_constraints: unknown) {
  return Promise.reject(new Error("USER_MEDIA_UNSUPPORTED"));
}

export function isYeonUserMediaPermissionDenied(_error: unknown) {
  return false;
}

export function createYeonUrl(input: string | URL, base?: string | URL) {
  return base === undefined ? new URL(input) : new URL(input, base);
}

export function createYeonUrlSearchParams(init?: YeonUrlSearchParamsInit) {
  return new URLSearchParams(
    init as ConstructorParameters<typeof URLSearchParams>[0]
  );
}

export function createYeonBlob(
  blobParts: BlobPart[],
  options?: BlobPropertyBag
) {
  return new Blob(blobParts, options);
}

export function createYeonJsonBlob(payload: string) {
  return createYeonBlob([payload], { type: "application/json" });
}

export function createYeonFormData() {
  return new FormData();
}

export function createYeonFile(
  fileBits: BlobPart[],
  fileName: string,
  options?: FilePropertyBag
) {
  return new File(fileBits, fileName, options);
}

export function createYeonObjectUrl(_object: Blob) {
  return null;
}

export function revokeYeonObjectUrl(_url: string | null | undefined) {
  return undefined;
}

export function createYeonAudioElement() {
  return null;
}

export function createYeonAnchorElement() {
  return null;
}

export function createYeonCanvasElement() {
  return null;
}

export function createYeonImageElement() {
  return null;
}

export function isYeonBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

export function isYeonFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function isYeonInputElement(
  _value: unknown
): _value is YeonInputElement {
  return false;
}

function getYeonRuntimeSingletons() {
  const runtimeGlobal = globalThis as YeonRuntimeGlobal;
  runtimeGlobal.__yeonRuntimeSingletons ??= new Map<string, unknown>();
  return runtimeGlobal.__yeonRuntimeSingletons;
}

export function getYeonRuntimeSingleton<TValue>(
  key: string,
  createValue: () => TValue
): TValue {
  const singletons = getYeonRuntimeSingletons();
  if (!singletons.has(key)) {
    singletons.set(key, createValue());
  }

  return singletons.get(key) as TValue;
}

export function getYeonNow() {
  return Date.now();
}

export function getYeonRandom() {
  return Math.random();
}

export function createYeonRandomUUID() {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && typeof cryptoObject.randomUUID === "function") {
    return cryptoObject.randomUUID();
  }

  return null;
}

export function getYeonRandomUint32() {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject && typeof cryptoObject.getRandomValues === "function") {
    const randomValues = new Uint32Array(1);
    cryptoObject.getRandomValues(randomValues);
    return randomValues[0] ?? 0;
  }

  return Math.floor(getYeonRandom() * 0x1_0000_0000);
}

export function getYeonViewportSize() {
  return null;
}

export function getYeonDocumentReadyState() {
  return null;
}

export function mountYeonGlobalStyle(_id: string, _css: string) {
  return () => undefined;
}

export function scheduleYeonTimeout(handler: () => void, delay: number) {
  return globalThis.setTimeout(handler, delay);
}

export function clearYeonTimeout(
  timeoutId: ReturnType<typeof globalThis.setTimeout> | null | undefined
) {
  if (timeoutId === null || timeoutId === undefined) {
    return;
  }

  globalThis.clearTimeout(timeoutId);
}

export function scheduleYeonInterval(handler: () => void, delay: number) {
  return globalThis.setInterval(handler, delay);
}

export function clearYeonInterval(
  intervalId: ReturnType<typeof globalThis.setInterval> | null | undefined
) {
  if (intervalId === null || intervalId === undefined) {
    return;
  }

  globalThis.clearInterval(intervalId);
}

export function delayYeon(delay: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, delay);
  });
}

export function requestYeonAnimationFrame(handler: (time: number) => void) {
  if (typeof globalThis.requestAnimationFrame !== "function") {
    return null;
  }

  return globalThis.requestAnimationFrame(handler);
}

export function cancelYeonAnimationFrame(frameId: number | null | undefined) {
  if (
    typeof globalThis.cancelAnimationFrame !== "function" ||
    frameId === null ||
    frameId === undefined
  ) {
    return;
  }

  globalThis.cancelAnimationFrame(frameId);
}

export function requestYeonIdleCallback(_handler: unknown, _options?: unknown) {
  return null;
}

export function cancelYeonIdleCallback(_id: number | null | undefined) {
  return undefined;
}

export function getYeonLocationSnapshot() {
  return null;
}

export function getYeonLocationOrigin() {
  return "";
}

export function getYeonDocumentTitle() {
  return "";
}

export function getYeonGtag() {
  return null;
}

export function createYeonGoogleAnalyticsBootstrapScript(
  _measurementId: string
) {
  return "";
}

export function getYeonWindowErrorHandler() {
  return null;
}

export function setYeonWindowErrorHandler(
  _handler: YeonWindowErrorHandler | null
) {
  return undefined;
}

export function callYeonWindowErrorHandler(
  _handler: YeonWindowErrorHandler,
  _message: YeonWindowErrorMessage,
  _source: YeonWindowErrorSource,
  _lineNumber?: number,
  _columnNumber?: number,
  _error?: Error
) {
  return false;
}

export function assignYeonLocation(_href: string) {
  return undefined;
}

export async function copyYeonClipboardText(_text: string) {
  return false;
}

export function canReadYeonClipboardItems() {
  return false;
}

export async function readYeonClipboardItems() {
  return [];
}

export function showYeonConfirm(_message: string) {
  return false;
}

export function showYeonAlert(
  title: string,
  message?: string,
  buttons?: readonly YeonAlertButton[]
) {
  Alert.alert(title, message, buttons as AlertButton[] | undefined);
}

const noopLoopingAudioController: YeonLoopingAudioController = {
  getSnapshot: () => STOPPED_LOOPING_AUDIO_SNAPSHOT,
  getServerSnapshot: () => STOPPED_LOOPING_AUDIO_SNAPSHOT,
  subscribe: () => () => undefined,
  toggle: async () => undefined,
};

export function createYeonLoopingAudioController(
  _options: YeonLoopingAudioOptions
) {
  return noopLoopingAudioController;
}
