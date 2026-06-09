export type YeonBrowserStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;
export type YeonBlob = Blob;
export type YeonBodyInit = BodyInit;
export type YeonAudioElement = HTMLAudioElement;
export type YeonAnchorElement = HTMLAnchorElement;
export type YeonCanvasElement = HTMLCanvasElement;
export type YeonCanvasRenderingContext2D = CanvasRenderingContext2D;
export type YeonImageElement = HTMLImageElement;
export type YeonInputElement = HTMLInputElement;
export type YeonDocumentReadyState = DocumentReadyState;
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
export type YeonMediaStream = MediaStream;
export type YeonRtcConfiguration = RTCConfiguration;
export type YeonRtcIceCandidateInit = RTCIceCandidateInit;
export type YeonRtcIceServer = RTCIceServer;
export type YeonRtcPeerConnection = RTCPeerConnection;
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

type YeonAnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: YeonGtagFunction;
};

export type YeonAlertButton = {
  onPress?: () => void;
  style?: "cancel" | "default" | "destructive";
  text?: string;
};

export type YeonGestureResponderEvent = unknown;
export type YeonPlatformOS = "web";
export type YeonStyleProp<T> =
  | T
  | readonly (T | null | false | undefined)[]
  | null
  | false
  | undefined;
export type YeonTextStyle = Record<string, unknown>;
export type YeonViewStyle = Record<string, unknown>;
export type YeonGtagFunction = (...args: unknown[]) => void;
export type YeonWindowErrorHandler = NonNullable<OnErrorEventHandler>;
export type YeonWindowErrorMessage = Parameters<YeonWindowErrorHandler>[0];
export type YeonWindowErrorSource = Parameters<YeonWindowErrorHandler>[1];

export function createYeonStyleSheet<TStyles extends Record<string, unknown>>(
  styles: TStyles
) {
  return styles;
}

export const yeonAbsoluteFillObject = {
  bottom: 0,
  left: 0,
  position: "absolute",
  right: 0,
  top: 0,
} as const;

export function getYeonPlatformOS(): YeonPlatformOS {
  return "web";
}

export function isYeonIOS() {
  return false;
}

export function isYeonWebPlatform() {
  return true;
}

export function useYeonWindowDimensions() {
  const viewportSize = getYeonViewportSize();

  return {
    height: viewportSize?.height ?? 0,
    width: viewportSize?.width ?? 0,
  };
}

const mountedStyleCounts = new Map<string, number>();

const STOPPED_LOOPING_AUDIO_SNAPSHOT: YeonLoopingAudioSnapshot = {
  playing: false,
  blocked: false,
};

const noopStorage: YeonBrowserStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function warnYeonRuntimeFallback(context: string, error: unknown) {
  console.warn(`[yeon-runtime] ${context}`, error);
}

function getBrowserStorage(kind: "local" | "session"): YeonBrowserStorage {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  return kind === "local" ? window.localStorage : window.sessionStorage;
}

function findMountedStyleElement(id: string) {
  if (typeof document === "undefined") {
    return null;
  }

  return (
    Array.from(
      document.querySelectorAll<HTMLStyleElement>(
        "style[data-yeon-global-style]"
      )
    ).find((element) => element.dataset.yeonGlobalStyle === id) ?? null
  );
}

export function getYeonLocalStorage() {
  return getBrowserStorage("local");
}

export function getYeonOptionalLocalStorage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch (error) {
    warnYeonRuntimeFallback("localStorage 접근 실패", error);
    return null;
  }
}

export function getYeonSessionStorage() {
  return getBrowserStorage("session");
}

export function readYeonLocalStorageItem(key: string) {
  try {
    return getYeonLocalStorage().getItem(key);
  } catch (error) {
    warnYeonRuntimeFallback("localStorage 읽기 실패", error);
    return null;
  }
}

export function writeYeonLocalStorageItem(key: string, value: string) {
  try {
    getYeonLocalStorage().setItem(key, value);
  } catch (error) {
    warnYeonRuntimeFallback("localStorage 쓰기 실패", error);
  }
}

export function removeYeonLocalStorageItem(key: string) {
  try {
    getYeonLocalStorage().removeItem(key);
  } catch (error) {
    warnYeonRuntimeFallback("localStorage 삭제 실패", error);
  }
}

export function readYeonSessionStorageItem(key: string) {
  try {
    return getYeonSessionStorage().getItem(key);
  } catch (error) {
    warnYeonRuntimeFallback("sessionStorage 읽기 실패", error);
    return null;
  }
}

export function writeYeonSessionStorageItem(key: string, value: string) {
  try {
    getYeonSessionStorage().setItem(key, value);
  } catch (error) {
    warnYeonRuntimeFallback("sessionStorage 쓰기 실패", error);
  }
}

export function removeYeonSessionStorageItem(key: string) {
  try {
    getYeonSessionStorage().removeItem(key);
  } catch (error) {
    warnYeonRuntimeFallback("sessionStorage 삭제 실패", error);
  }
}

export function dispatchYeonWindowCustomEvent<TDetail>(
  type: string,
  detail: TDetail
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(type, { detail }));
}

export function addYeonWindowEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void;
export function addYeonWindowEventListener(
  type: string,
  listener: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
): () => void;
export function addYeonWindowEventListener(
  type: string,
  listener: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(type, listener, options);
  return () => window.removeEventListener(type, listener, options);
}

export function getYeonCustomEventDetail<TDetail>(event: Event) {
  if (!("detail" in event)) {
    return null;
  }

  return (event as { detail?: TDetail }).detail ?? null;
}

export function matchYeonMedia(query: string) {
  if (typeof window === "undefined" || !window.matchMedia) {
    return null;
  }

  return window.matchMedia(query);
}

export function sendYeonBeacon(path: string, payload: BodyInit) {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) {
    return false;
  }

  return navigator.sendBeacon(path, payload);
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

export function createYeonRtcPeerConnection(configuration?: RTCConfiguration) {
  if (typeof RTCPeerConnection === "undefined") {
    return null;
  }

  return new RTCPeerConnection(configuration);
}

export function hasYeonUserMediaSupport() {
  return Boolean(
    typeof RTCPeerConnection !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.mediaDevices?.getUserMedia
  );
}

export function requestYeonUserMedia(constraints: MediaStreamConstraints) {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.mediaDevices?.getUserMedia !== "function"
  ) {
    return Promise.reject(new Error("USER_MEDIA_UNSUPPORTED"));
  }

  return navigator.mediaDevices.getUserMedia(constraints);
}

export function isYeonUserMediaPermissionDenied(error: unknown) {
  return error instanceof DOMException && error.name === "NotAllowedError";
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

export function createYeonObjectUrl(object: Blob) {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return null;
  }

  return URL.createObjectURL(object);
}

export function revokeYeonObjectUrl(url: string | null | undefined) {
  if (!url || typeof URL === "undefined") {
    return;
  }

  URL.revokeObjectURL(url);
}

export function createYeonAudioElement() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.createElement("audio");
}

export function createYeonAnchorElement() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.createElement("a");
}

export function createYeonCanvasElement() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.createElement("canvas");
}

export function createYeonImageElement() {
  if (typeof Image === "undefined") {
    return null;
  }

  return new Image();
}

export function isYeonBlob(value: unknown): value is Blob {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

export function isYeonFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

export function isYeonInputElement(value: unknown): value is YeonInputElement {
  return (
    typeof HTMLInputElement !== "undefined" && value instanceof HTMLInputElement
  );
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
  if (typeof window === "undefined") {
    return null;
  }

  return {
    height: window.innerHeight,
    width: window.innerWidth,
  };
}

export function getYeonDocumentReadyState() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.readyState;
}

export function mountYeonGlobalStyle(id: string, css: string) {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  let styleElement = findMountedStyleElement(id);
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.dataset.yeonGlobalStyle = id;
    document.head.append(styleElement);
  }

  if (styleElement.textContent !== css) {
    styleElement.textContent = css;
  }

  mountedStyleCounts.set(id, (mountedStyleCounts.get(id) ?? 0) + 1);

  return () => {
    const nextCount = (mountedStyleCounts.get(id) ?? 1) - 1;
    if (nextCount > 0) {
      mountedStyleCounts.set(id, nextCount);
      return;
    }

    mountedStyleCounts.delete(id);
    styleElement?.remove();
  };
}

export function scheduleYeonTimeout(handler: () => void, delay: number) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.setTimeout(handler, delay);
}

export function clearYeonTimeout(timeoutId: number | null | undefined) {
  if (
    typeof window === "undefined" ||
    timeoutId === null ||
    timeoutId === undefined
  ) {
    return;
  }

  window.clearTimeout(timeoutId);
}

export function scheduleYeonInterval(handler: () => void, delay: number) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.setInterval(handler, delay);
}

export function clearYeonInterval(intervalId: number | null | undefined) {
  if (
    typeof window === "undefined" ||
    intervalId === null ||
    intervalId === undefined
  ) {
    return;
  }

  window.clearInterval(intervalId);
}

export function delayYeon(delay: number) {
  return new Promise<void>((resolve) => {
    globalThis.setTimeout(resolve, delay);
  });
}

export function requestYeonAnimationFrame(handler: FrameRequestCallback) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.requestAnimationFrame(handler);
}

export function cancelYeonAnimationFrame(frameId: number | null | undefined) {
  if (
    typeof window === "undefined" ||
    frameId === null ||
    frameId === undefined
  ) {
    return;
  }

  window.cancelAnimationFrame(frameId);
}

export function requestYeonIdleCallback(
  handler: IdleRequestCallback,
  options?: IdleRequestOptions
) {
  if (typeof window === "undefined") {
    return null;
  }

  const browserWindow = window as Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number;
  };

  return browserWindow.requestIdleCallback?.(handler, options) ?? null;
}

export function cancelYeonIdleCallback(id: number | null | undefined) {
  if (typeof window === "undefined" || id === null || id === undefined) {
    return;
  }

  const browserWindow = window as Window & {
    cancelIdleCallback?: (handle: number) => void;
  };

  browserWindow.cancelIdleCallback?.(id);
}

export function getYeonLocationSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const { href, origin, pathname, search, hash } = window.location;
  return { href, origin, pathname, search, hash };
}

export function getYeonLocationOrigin() {
  return getYeonLocationSnapshot()?.origin ?? "";
}

export function getYeonDocumentTitle() {
  return typeof document === "undefined" ? "" : document.title;
}

export function getYeonGtag() {
  if (typeof window === "undefined") {
    return null;
  }

  const analyticsWindow = window as YeonAnalyticsWindow;

  if (!Array.isArray(analyticsWindow.dataLayer)) {
    analyticsWindow.dataLayer = [];
  }

  if (typeof analyticsWindow.gtag !== "function") {
    analyticsWindow.gtag = (...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args);
    };
  }

  return analyticsWindow.gtag;
}

export function createYeonGoogleAnalyticsBootstrapScript(
  measurementId: string
) {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}');
  `;
}

export function getYeonWindowErrorHandler() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.onerror;
}

export function setYeonWindowErrorHandler(
  handler: YeonWindowErrorHandler | null
) {
  if (typeof window === "undefined") {
    return;
  }

  window.onerror = handler;
}

export function callYeonWindowErrorHandler(
  handler: YeonWindowErrorHandler,
  message: YeonWindowErrorMessage,
  source: YeonWindowErrorSource,
  lineNumber?: number,
  columnNumber?: number,
  error?: Error
) {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    handler.call(window, message, source, lineNumber, columnNumber, error) ??
    false
  );
}

export function assignYeonLocation(href: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(href);
}

export async function copyYeonClipboardText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }

  await navigator.clipboard.writeText(text);
  return true;
}

export function canReadYeonClipboardItems() {
  return Boolean(
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.read === "function"
  );
}

export async function readYeonClipboardItems() {
  if (!canReadYeonClipboardItems()) {
    return [];
  }

  return navigator.clipboard.read();
}

export function showYeonConfirm(message: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.confirm(message);
}

export function showYeonAlert(
  title: string,
  message?: string,
  _buttons?: readonly YeonAlertButton[]
) {
  if (typeof window === "undefined") {
    return;
  }

  window.alert(message ? `${title}\n\n${message}` : title);
}

class BrowserYeonLoopingAudioController implements YeonLoopingAudioController {
  private audio: HTMLAudioElement | null = null;
  private blocked = false;
  private snapshot = STOPPED_LOOPING_AUDIO_SNAPSHOT;
  private readonly listeners = new Set<YeonLoopingAudioListener>();

  constructor(private readonly options: YeonLoopingAudioOptions) {}

  getSnapshot() {
    return this.snapshot;
  }

  getServerSnapshot() {
    return STOPPED_LOOPING_AUDIO_SNAPSHOT;
  }

  subscribe(listener: YeonLoopingAudioListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async toggle() {
    const audio = this.getAudio();
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      this.blocked = false;
      this.emit();
      return;
    }

    try {
      await audio.play();
      this.blocked = false;
      this.emit();
    } catch (error) {
      warnYeonRuntimeFallback("루프 오디오 재생 실패", error);
      this.blocked = true;
      this.emit();
    }
  }

  private getAudio() {
    if (typeof Audio === "undefined") {
      return null;
    }

    if (!this.audio) {
      this.audio = new Audio(this.options.src);
      this.audio.loop = true;
      this.audio.volume = this.options.volume ?? 1;
      this.audio.preload = "auto";
      this.audio.addEventListener("play", this.handleAudioStateChange);
      this.audio.addEventListener("pause", this.handleAudioStateChange);
      this.audio.addEventListener("ended", this.handleAudioStateChange);
      this.updateSnapshot();
    }

    return this.audio;
  }

  private readonly handleAudioStateChange = () => {
    this.blocked = false;
    this.emit();
  };

  private emit() {
    this.updateSnapshot();
    this.listeners.forEach((listener) => listener());
  }

  private updateSnapshot() {
    const nextSnapshot = {
      playing: Boolean(this.audio && !this.audio.paused),
      blocked: this.blocked,
    };

    if (
      this.snapshot.playing === nextSnapshot.playing &&
      this.snapshot.blocked === nextSnapshot.blocked
    ) {
      return;
    }

    this.snapshot = nextSnapshot;
  }
}

export function createYeonLoopingAudioController(
  options: YeonLoopingAudioOptions
): YeonLoopingAudioController {
  return new BrowserYeonLoopingAudioController(options);
}
