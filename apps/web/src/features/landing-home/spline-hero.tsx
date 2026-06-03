"use client";
import { YeonPositionedBox, YeonText, YeonView } from "@yeon/ui";
import {
  addYeonWindowEventListener,
  callYeonWindowErrorHandler,
  cancelYeonAnimationFrame,
  cancelYeonIdleCallback,
  getYeonDocumentReadyState,
  getYeonWindowErrorHandler,
  matchYeonMedia,
  requestYeonAnimationFrame,
  requestYeonIdleCallback,
  setYeonWindowErrorHandler,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import type { YeonWindowErrorHandler } from "@yeon/ui/runtime/YeonBrowserRuntime";
import {
  Component,
  memo,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ComponentType, ReactNode } from "react";
import type { Application } from "@splinetool/runtime";

const SPLINE_SCENE =
  "https://prod.spline.design/3K3aYKR6mrKFknHz/scene.splinecode";

const SPLINE_ERROR_PATTERN = /reading 'position'/;
const MOBILE_SPLINE_MEDIA_QUERY = "(max-width: 767px)";
const SPLINE_FADE_DURATION = 240;
const SPLINE_HERO_CLASS = {
  container:
    "absolute inset-0 h-full w-full [contain:layout_paint] [&>div]:!block [&>div]:!h-full [&>div]:!w-full [&_canvas]:!block [&_canvas]:!h-full [&_canvas]:!w-full",
  layer:
    "absolute inset-0 transition-[opacity,visibility] duration-[220ms] ease-in-out",
  visible: "visible opacity-100",
  hidden: "invisible opacity-0",
  dimmed: "opacity-[0.18]",
  fallback:
    "relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_18%_72%,rgba(229,229,229,0.64),transparent_28%),radial-gradient(circle_at_76%_24%,rgba(250,250,250,0.9),transparent_22%),linear-gradient(140deg,#ffffff_0%,#fafafa_100%)]",
  fallbackGlow:
    "absolute bottom-[12%] left-[8%] h-[min(42vw,660px)] w-[min(42vw,660px)] rounded-full bg-[radial-gradient(circle,rgba(17,17,17,0.08)_0%,rgba(170,170,170,0.08)_32%,transparent_72%)] opacity-[0.52] max-[640px]:bottom-[8%] max-[640px]:left-1/2 max-[640px]:h-[92vw] max-[640px]:w-[92vw] max-[640px]:-translate-x-1/2",
  fallbackMesh:
    "absolute bottom-[18%] right-[10%] top-[12%] w-[min(31vw,480px)] rounded-[28px] border border-[#e5e5e5] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,250,250,0.72)),linear-gradient(135deg,rgba(229,229,229,0.72),rgba(255,255,255,0.86))] shadow-[0_18px_42px_rgba(17,17,17,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] before:absolute before:inset-[18px] before:rounded-[20px] before:bg-[linear-gradient(rgba(17,17,17,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.04)_1px,transparent_1px)] before:bg-[length:38px_38px] before:content-[''] before:[mask-image:linear-gradient(180deg,rgba(17,17,17,0.9),transparent_92%)] after:absolute after:inset-[18px] after:rounded-[20px] after:border after:border-[#e5e5e5] after:shadow-[inset_0_0_0_1px_rgba(17,17,17,0.04)] after:content-[''] max-[980px]:bottom-auto max-[980px]:left-1/2 max-[980px]:right-auto max-[980px]:top-[12%] max-[980px]:h-[min(62vw,420px)] max-[980px]:w-[min(72vw,520px)] max-[980px]:-translate-x-1/2 max-[980px]:translate-y-0 max-[640px]:top-[18%] max-[640px]:h-[28vh] max-[640px]:w-[calc(100vw-56px)] max-[640px]:opacity-[0.42]",
  fallbackOrbit:
    "absolute right-[9%] top-[14%] h-[min(39vw,560px)] w-[min(39vw,560px)] rounded-full border border-[#e5e5e5] opacity-[0.42] max-[980px]:left-1/2 max-[980px]:right-auto max-[980px]:top-[8%] max-[980px]:h-[min(84vw,620px)] max-[980px]:w-[min(84vw,620px)] max-[980px]:-translate-x-1/2 max-[980px]:translate-y-0",
  fallbackColumn:
    "absolute right-[clamp(28px,6vw,90px)] top-[54%] grid w-[min(30vw,420px)] -translate-y-1/2 gap-3.5 max-[980px]:bottom-[13%] max-[980px]:left-1/2 max-[980px]:right-auto max-[980px]:top-auto max-[980px]:w-[min(80vw,460px)] max-[980px]:-translate-x-1/2 max-[980px]:translate-y-0 max-[640px]:hidden",
  fallbackCard:
    "rounded-3xl border border-[#e5e5e5] bg-[rgba(255,255,255,0.86)] px-5 pb-[18px] pt-5 shadow-[0_16px_40px_rgba(17,17,17,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
  fallbackEyebrow:
    "mb-2 inline-flex text-[11px] font-bold tracking-[0.22em] text-[#666]",
  fallbackTitle:
    "block text-[clamp(22px,2vw,30px)] font-bold leading-[1.14] tracking-[-0.04em] text-[#111]",
  fallbackDescription: "m-0 mt-3 text-[13px] leading-[1.68] text-[#666]",
  fallbackMiniStack: "hidden grid-cols-2 gap-2",
  fallbackMiniCard:
    "rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] px-[13px] pb-[11px] pt-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
  fallbackMiniLabel:
    "mb-1.5 block text-[10px] font-bold tracking-[0.18em] text-[#aaa]",
  fallbackMiniValue:
    "text-[13px] font-bold leading-[1.32] tracking-[-0.03em] text-[#111]",
  fallbackSignalRow: "grid gap-2",
  fallbackSignal:
    "flex items-center justify-between gap-3 rounded-2xl border border-[#e5e5e5] bg-[#fafafa] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
  fallbackSignalLabel:
    "text-[11px] font-bold uppercase tracking-[0.16em] text-[#aaa]",
  fallbackSignalValue: "text-sm font-bold tracking-[-0.02em] text-[#111]",
} as const;

type SplineProps = {
  scene: string;
  onLoad?: (app: Application) => void;
  renderOnDemand?: boolean;
};

type SplineComponentType = ComponentType<SplineProps>;
type SplineRuntimeErrorCandidate = {
  error?: unknown;
  filename?: string;
  message?: string;
};

let splineModulePromise: Promise<{ default: SplineComponentType }> | null =
  null;
let cachedSplineComponent: SplineComponentType | null = null;

function matchesSplineRuntimeError({
  error,
  filename = "",
  message = "",
}: SplineRuntimeErrorCandidate) {
  if (!SPLINE_ERROR_PATTERN.test(message)) {
    return false;
  }

  const stack =
    error instanceof Error ? (error.stack ?? "") : String(error ?? "");

  return /spline/i.test(filename) || /spline/i.test(stack);
}

function prefetchSplineComponent() {
  if (cachedSplineComponent) {
    return Promise.resolve(cachedSplineComponent);
  }

  if (!splineModulePromise) {
    splineModulePromise = import("@splinetool/react-spline").then((module) => {
      cachedSplineComponent = module.default;
      return module;
    });
  }

  return splineModulePromise.then((module) => module.default);
}

function SplineFallbackScene() {
  return (
    <YeonView className={SPLINE_HERO_CLASS.fallback} aria-hidden="true">
      <YeonView className={SPLINE_HERO_CLASS.fallbackGlow} />
      <YeonView className={SPLINE_HERO_CLASS.fallbackMesh} />
      <YeonView className={SPLINE_HERO_CLASS.fallbackOrbit} />
      <YeonView className={SPLINE_HERO_CLASS.fallbackColumn}>
        <YeonView className={SPLINE_HERO_CLASS.fallbackCard}>
          <YeonText
            as="span"
            variant="unstyled"
            tone="inherit"
            className={SPLINE_HERO_CLASS.fallbackEyebrow}
          >
            LIVE RECORD
          </YeonText>
          <YeonText
            as="strong"
            variant="unstyled"
            tone="inherit"
            className={SPLINE_HERO_CLASS.fallbackTitle}
          >
            상담이 끝나는 순간, 기록은 이미 정리됩니다
          </YeonText>
          <YeonText
            variant="unstyled"
            tone="inherit"
            className={SPLINE_HERO_CLASS.fallbackDescription}
          >
            원문부터 요약, 다음 액션까지 한 흐름으로 이어지는 상담 워크스페이스.
          </YeonText>
        </YeonView>
        <YeonView className={SPLINE_HERO_CLASS.fallbackMiniStack}>
          <YeonView className={SPLINE_HERO_CLASS.fallbackMiniCard}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackMiniLabel}
            >
              RECORD
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackMiniValue}
            >
              원문 누락 없이 남기기
            </YeonText>
          </YeonView>
          <YeonView className={SPLINE_HERO_CLASS.fallbackMiniCard}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackMiniLabel}
            >
              FOLLOW-UP
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackMiniValue}
            >
              후속 조치까지 바로 연결
            </YeonText>
          </YeonView>
        </YeonView>
        <YeonView className={SPLINE_HERO_CLASS.fallbackSignalRow}>
          <YeonView className={SPLINE_HERO_CLASS.fallbackSignal}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackSignalLabel}
            >
              전사
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackSignalValue}
            >
              긴 상담도 안정적으로
            </YeonText>
          </YeonView>
          <YeonView className={SPLINE_HERO_CLASS.fallbackSignal}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackSignalLabel}
            >
              요약
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackSignalValue}
            >
              실무형 구조로 정리
            </YeonText>
          </YeonView>
          <YeonView className={SPLINE_HERO_CLASS.fallbackSignal}>
            <YeonText
              as="span"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackSignalLabel}
            >
              후속조치
            </YeonText>
            <YeonText
              as="strong"
              variant="unstyled"
              tone="inherit"
              className={SPLINE_HERO_CLASS.fallbackSignalValue}
            >
              다음 상담 준비까지
            </YeonText>
          </YeonView>
        </YeonView>
      </YeonView>
    </YeonView>
  );
}

class SplineErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return <SplineFallbackScene />;
    }
    return this.props.children;
  }
}

function SplineCanvas({
  paused,
  onLiveSceneChange,
}: {
  paused: boolean;
  onLiveSceneChange?: (isLive: boolean) => void;
}) {
  const [error, setError] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean | null>(
    null
  );
  const [shouldLoadSpline, setShouldLoadSpline] = useState(false);
  const [SplineComponent, setSplineComponent] =
    useState<SplineComponentType | null>(cachedSplineComponent);
  const [hasLiveScene, setHasLiveScene] = useState(false);
  const handledSplineRuntimeErrorRef = useRef(false);
  const splineApplicationRef = useRef<Application | null>(null);

  const activateFallback = useCallback(() => {
    if (handledSplineRuntimeErrorRef.current) {
      return;
    }

    handledSplineRuntimeErrorRef.current = true;

    const application = splineApplicationRef.current;
    splineApplicationRef.current = null;

    if (application) {
      try {
        application.stop();
      } catch {
        // Spline runtime cleanup can fail while the scene is already broken.
      }
    }

    setHasLiveScene(false);
    setError(true);
  }, []);

  const handleError = useCallback(() => {
    activateFallback();
  }, [activateFallback]);

  const handleLoad = useCallback(
    (application: Application) => {
      splineApplicationRef.current = application;
      setHasLiveScene(true);

      if (paused) {
        application.stop();
        return;
      }

      application.play();
      application.requestRender();
    },
    [paused]
  );

  useEffect(() => {
    const mediaQuery = matchYeonMedia(MOBILE_SPLINE_MEDIA_QUERY);
    if (!mediaQuery) return;

    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    syncViewport();

    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (isMobileViewport !== false) {
      return;
    }

    const rafId = requestYeonAnimationFrame(() => {
      void prefetchSplineComponent().catch(() => {
        activateFallback();
      });
    });

    return () => {
      cancelYeonAnimationFrame(rafId);
    };
  }, [isMobileViewport]);

  useEffect(() => {
    if (isMobileViewport !== false || shouldLoadSpline) {
      return;
    }

    const cleanupHandlers: Array<() => void> = [];
    let cancelled = false;

    const enableSpline = () => {
      if (cancelled) {
        return;
      }

      startTransition(() => {
        setShouldLoadSpline(true);
      });
    };

    const prefetchAndEnableSpline = () => {
      void prefetchSplineComponent()
        .then(() => {
          enableSpline();
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          activateFallback();
        });
    };

    const registerInteractionPrefetch = (eventName: keyof WindowEventMap) => {
      const handler = () => {
        prefetchAndEnableSpline();
      };

      const cleanup = addYeonWindowEventListener(eventName, handler, {
        once: true,
        passive: true,
      });

      cleanupHandlers.push(() => {
        cleanup();
      });
    };

    registerInteractionPrefetch("pointerdown");
    registerInteractionPrefetch("touchstart");
    registerInteractionPrefetch("wheel");
    registerInteractionPrefetch("keydown");

    if (getYeonDocumentReadyState() === "complete") {
      const idleId = requestYeonIdleCallback(() => {
        prefetchAndEnableSpline();
      });

      if (idleId !== null) {
        cleanupHandlers.push(() => {
          cancelYeonIdleCallback(idleId);
        });
      } else {
        const rafId = requestYeonAnimationFrame(() => {
          prefetchAndEnableSpline();
        });

        cleanupHandlers.push(() => {
          cancelYeonAnimationFrame(rafId);
        });
      }
    } else {
      const handleWindowLoad = () => {
        prefetchAndEnableSpline();
      };

      const cleanup = addYeonWindowEventListener("load", handleWindowLoad, {
        once: true,
      });

      cleanupHandlers.push(() => {
        cleanup();
      });
    }

    return () => {
      cancelled = true;
      cleanupHandlers.forEach((cleanup) => cleanup());
    };
  }, [isMobileViewport, shouldLoadSpline]);

  useEffect(() => {
    if (isMobileViewport !== false || !shouldLoadSpline || error) {
      return;
    }

    let active = true;
    let frameId: number | null = null;

    void prefetchSplineComponent()
      .then((module) => {
        if (!active) {
          return;
        }

        frameId = requestYeonAnimationFrame(() => {
          if (!active) {
            return;
          }

          startTransition(() => {
            setSplineComponent(() => module);
          });
        });
      })
      .catch(() => {
        if (!active) {
          return;
        }

        activateFallback();
      });

    return () => {
      active = false;
      if (frameId !== null) {
        cancelYeonAnimationFrame(frameId);
      }
    };
  }, [error, isMobileViewport, shouldLoadSpline]);

  useEffect(() => {
    const application = splineApplicationRef.current;
    if (!application) {
      return;
    }

    if (paused) {
      application.stop();
      return;
    }

    application.play();
    application.requestRender();
  }, [paused]);

  useEffect(() => {
    if (isMobileViewport !== false) {
      return;
    }

    function handleWindowError(event: ErrorEvent) {
      const message = event.message ?? "";
      const filename = event.filename ?? "";

      if (
        !matchesSplineRuntimeError({
          error: event.error,
          filename,
          message,
        })
      ) {
        return;
      }

      event.preventDefault();
      activateFallback();
    }

    const previousOnError = getYeonWindowErrorHandler();
    const splineOnError: YeonWindowErrorHandler = (
      message,
      source,
      _lineno,
      _colno,
      error
    ) => {
      if (
        matchesSplineRuntimeError({
          error,
          filename: typeof source === "string" ? source : "",
          message: typeof message === "string" ? message : "",
        })
      ) {
        activateFallback();
        return true;
      }

      if (typeof previousOnError === "function") {
        return callYeonWindowErrorHandler(
          previousOnError,
          message,
          source,
          _lineno,
          _colno,
          error
        );
      }

      return false;
    };

    setYeonWindowErrorHandler(splineOnError);
    const cleanupErrorListener = addYeonWindowEventListener(
      "error",
      handleWindowError,
      true
    );

    return () => {
      cleanupErrorListener();
      if (getYeonWindowErrorHandler() === splineOnError) {
        setYeonWindowErrorHandler(previousOnError);
      }
    };
  }, [activateFallback, isMobileViewport]);

  useEffect(() => {
    return () => {
      splineApplicationRef.current = null;
    };
  }, []);

  const hasDesktopViewport = isMobileViewport === false;
  const shouldRenderSpline =
    hasDesktopViewport && Boolean(SplineComponent) && !error;
  const shouldShowSpline = shouldRenderSpline && hasLiveScene;
  const shouldShowFallback = !hasDesktopViewport || error || !hasLiveScene;

  useEffect(() => {
    onLiveSceneChange?.(shouldShowSpline);
  }, [onLiveSceneChange, shouldShowSpline]);

  return (
    <>
      <YeonView
        aria-hidden="true"
        className={`pointer-events-none ${SPLINE_HERO_CLASS.layer} ${
          shouldShowFallback
            ? SPLINE_HERO_CLASS.visible
            : SPLINE_HERO_CLASS.hidden
        }`}
      >
        <SplineFallbackScene />
      </YeonView>
      <YeonPositionedBox
        aria-hidden={!shouldShowSpline}
        className={`${SPLINE_HERO_CLASS.layer} ${
          shouldShowSpline
            ? SPLINE_HERO_CLASS.visible
            : SPLINE_HERO_CLASS.hidden
        } ${paused ? SPLINE_HERO_CLASS.dimmed : ""}`}
        box={{
          transitionDuration: `${SPLINE_FADE_DURATION}ms`,
        }}
      >
        <SplineErrorBoundary onError={handleError}>
          {SplineComponent ? (
            <SplineComponent
              scene={SPLINE_SCENE}
              onLoad={handleLoad}
              renderOnDemand={false}
            />
          ) : null}
        </SplineErrorBoundary>
      </YeonPositionedBox>
    </>
  );
}

type SplineHeroProps = {
  paused?: boolean;
  onLiveSceneChange?: (isLive: boolean) => void;
};

export const SplineHero = memo(function SplineHero({
  paused = false,
  onLiveSceneChange,
}: SplineHeroProps) {
  return (
    <YeonView
      className={SPLINE_HERO_CLASS.container}
      data-landing-spline="true"
    >
      <SplineCanvas paused={paused} onLiveSceneChange={onLiveSceneChange} />
    </YeonView>
  );
});
