"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  IMPORT_WORKSPACE_DEFAULT_RATIO,
  IMPORT_WORKSPACE_DESKTOP_MEDIA_QUERY,
  IMPORT_WORKSPACE_MAX_RATIO,
  IMPORT_WORKSPACE_MIN_LEFT_PANE_PX,
  IMPORT_WORKSPACE_MIN_RATIO,
  IMPORT_WORKSPACE_MIN_RIGHT_PANE_PX,
  IMPORT_WORKSPACE_RESIZER_WIDTH,
  IMPORT_WORKSPACE_SPLIT_STORAGE_KEY,
  IMPORT_WORKSPACE_STACKED_DEFAULT_RATIO,
  IMPORT_WORKSPACE_STACKED_MAX_RATIO,
  IMPORT_WORKSPACE_STACKED_MIN_RATIO,
  IMPORT_WORKSPACE_STACKED_RESIZER_HEIGHT,
  IMPORT_WORKSPACE_STACKED_SPLIT_STORAGE_KEY,
  IMPORT_WORKSPACE_MIN_BOTTOM_PANE_PX,
  IMPORT_WORKSPACE_MIN_TOP_PANE_PX,
  getExpandedBottomPanelHeight,
} from "../cloud-import-layout-constants";

type ResizeState = {
  startClientX: number;
  startRatio: number;
  availableWidth: number;
};

type StackedResizeState = {
  startClientY: number;
  startRatio: number;
  availableHeight: number;
};

type UseCloudImportWorkspaceSplitParams = {
  expanded: boolean;
};

export function useCloudImportWorkspaceSplit({
  expanded,
}: UseCloudImportWorkspaceSplitParams) {
  const [desktopSplitRatio, setDesktopSplitRatio] = useState(
    IMPORT_WORKSPACE_DEFAULT_RATIO
  );
  const [stackedSplitRatio, setStackedSplitRatio] = useState(
    IMPORT_WORKSPACE_STACKED_DEFAULT_RATIO
  );
  const [isDesktopSplitDragging, setIsDesktopSplitDragging] = useState(false);
  const [isStackedSplitDragging, setIsStackedSplitDragging] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(IMPORT_WORKSPACE_DESKTOP_MEDIA_QUERY).matches
  );

  const previewWorkspaceRef = useRef<HTMLDivElement | null>(null);
  const desktopSplitRatioRef = useRef(IMPORT_WORKSPACE_DEFAULT_RATIO);
  const stackedSplitRatioRef = useRef(IMPORT_WORKSPACE_STACKED_DEFAULT_RATIO);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const stackedResizeStateRef = useRef<StackedResizeState | null>(null);

  const clampDesktopSplitRatio = useCallback((ratio: number) => {
    const containerWidth =
      previewWorkspaceRef.current?.getBoundingClientRect().width ?? 0;
    const availableWidth = Math.max(
      containerWidth - IMPORT_WORKSPACE_RESIZER_WIDTH,
      1
    );

    if (!containerWidth) {
      return Math.min(
        IMPORT_WORKSPACE_MAX_RATIO,
        Math.max(IMPORT_WORKSPACE_MIN_RATIO, ratio)
      );
    }

    const minRatio = Math.max(
      IMPORT_WORKSPACE_MIN_RATIO,
      IMPORT_WORKSPACE_MIN_LEFT_PANE_PX / availableWidth
    );
    const maxRatio = Math.min(
      IMPORT_WORKSPACE_MAX_RATIO,
      1 - IMPORT_WORKSPACE_MIN_RIGHT_PANE_PX / availableWidth
    );

    if (minRatio >= maxRatio) {
      return Math.min(
        IMPORT_WORKSPACE_MAX_RATIO,
        Math.max(IMPORT_WORKSPACE_MIN_RATIO, ratio)
      );
    }

    return Math.min(maxRatio, Math.max(minRatio, ratio));
  }, []);

  const clampStackedSplitRatio = useCallback((ratio: number) => {
    const containerHeight =
      previewWorkspaceRef.current?.getBoundingClientRect().height ?? 0;
    const availableHeight = Math.max(
      containerHeight - IMPORT_WORKSPACE_STACKED_RESIZER_HEIGHT,
      1
    );

    if (!containerHeight) {
      return Math.min(
        IMPORT_WORKSPACE_STACKED_MAX_RATIO,
        Math.max(IMPORT_WORKSPACE_STACKED_MIN_RATIO, ratio)
      );
    }

    const minRatio = Math.max(
      IMPORT_WORKSPACE_STACKED_MIN_RATIO,
      IMPORT_WORKSPACE_MIN_TOP_PANE_PX / availableHeight
    );
    const maxRatio = Math.min(
      IMPORT_WORKSPACE_STACKED_MAX_RATIO,
      1 - IMPORT_WORKSPACE_MIN_BOTTOM_PANE_PX / availableHeight
    );

    if (minRatio >= maxRatio) {
      return Math.min(
        IMPORT_WORKSPACE_STACKED_MAX_RATIO,
        Math.max(IMPORT_WORKSPACE_STACKED_MIN_RATIO, ratio)
      );
    }

    return Math.min(maxRatio, Math.max(minRatio, ratio));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia(IMPORT_WORKSPACE_DESKTOP_MEDIA_QUERY);
    const syncViewport = () => {
      setIsDesktopViewport(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncViewport);
    };
  }, []);

  useEffect(() => {
    const savedRatio = window.localStorage.getItem(
      IMPORT_WORKSPACE_SPLIT_STORAGE_KEY
    );

    if (!savedRatio) return;

    const parsed = Number(savedRatio);
    if (!Number.isFinite(parsed)) return;

    setDesktopSplitRatio(clampDesktopSplitRatio(parsed));
  }, [clampDesktopSplitRatio]);

  useEffect(() => {
    const savedRatio = window.localStorage.getItem(
      IMPORT_WORKSPACE_STACKED_SPLIT_STORAGE_KEY
    );

    if (!savedRatio) return;

    const parsed = Number(savedRatio);
    if (!Number.isFinite(parsed)) return;

    setStackedSplitRatio(clampStackedSplitRatio(parsed));
  }, [clampStackedSplitRatio]);

  useEffect(() => {
    desktopSplitRatioRef.current = desktopSplitRatio;
  }, [desktopSplitRatio]);

  useEffect(() => {
    stackedSplitRatioRef.current = stackedSplitRatio;
  }, [stackedSplitRatio]);

  const buildExpandedPreviewShellGridTemplate = useCallback((ratio: number) => {
    return `minmax(${IMPORT_WORKSPACE_MIN_LEFT_PANE_PX}px, ${ratio}fr) ${IMPORT_WORKSPACE_RESIZER_WIDTH}px minmax(${IMPORT_WORKSPACE_MIN_RIGHT_PANE_PX}px, ${Math.max(0.05, 1 - ratio)}fr)`;
  }, []);

  const applyExpandedPreviewShellRatio = useCallback(
    (ratio: number) => {
      if (!expanded || !previewWorkspaceRef.current) return;
      previewWorkspaceRef.current.style.gridTemplateColumns =
        buildExpandedPreviewShellGridTemplate(ratio);
    },
    [buildExpandedPreviewShellGridTemplate, expanded]
  );

  useEffect(() => {
    window.localStorage.setItem(
      IMPORT_WORKSPACE_SPLIT_STORAGE_KEY,
      desktopSplitRatio.toFixed(4)
    );
  }, [desktopSplitRatio]);

  useEffect(() => {
    window.localStorage.setItem(
      IMPORT_WORKSPACE_STACKED_SPLIT_STORAGE_KEY,
      stackedSplitRatio.toFixed(4)
    );
  }, [stackedSplitRatio]);

  useEffect(() => {
    applyExpandedPreviewShellRatio(desktopSplitRatio);
  }, [applyExpandedPreviewShellRatio, desktopSplitRatio]);

  useEffect(() => {
    if (!expanded) return;

    const syncRatiosToViewport = () => {
      setDesktopSplitRatio((currentRatio) =>
        clampDesktopSplitRatio(currentRatio)
      );
      setStackedSplitRatio((currentRatio) =>
        clampStackedSplitRatio(currentRatio)
      );
    };

    syncRatiosToViewport();
    window.addEventListener("resize", syncRatiosToViewport);

    return () => {
      window.removeEventListener("resize", syncRatiosToViewport);
    };
  }, [clampDesktopSplitRatio, clampStackedSplitRatio, expanded]);

  useEffect(() => {
    if (!isDesktopSplitDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = resizeStateRef.current;
      if (!resizeState) return;

      const deltaX = event.clientX - resizeState.startClientX;
      const nextRatio =
        resizeState.startRatio + deltaX / resizeState.availableWidth;
      const clampedRatio = clampDesktopSplitRatio(nextRatio);
      desktopSplitRatioRef.current = clampedRatio;
      applyExpandedPreviewShellRatio(clampedRatio);
    };

    const stopDragging = () => {
      resizeStateRef.current = null;
      setIsDesktopSplitDragging(false);
      setDesktopSplitRatio(desktopSplitRatioRef.current);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [
    applyExpandedPreviewShellRatio,
    clampDesktopSplitRatio,
    isDesktopSplitDragging,
  ]);

  useEffect(() => {
    if (!isStackedSplitDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const resizeState = stackedResizeStateRef.current;
      if (!resizeState) return;

      const deltaY = event.clientY - resizeState.startClientY;
      const nextRatio =
        resizeState.startRatio + deltaY / resizeState.availableHeight;
      const clampedRatio = clampStackedSplitRatio(nextRatio);
      stackedSplitRatioRef.current = clampedRatio;
      setStackedSplitRatio(clampedRatio);
    };

    const stopDragging = () => {
      stackedResizeStateRef.current = null;
      setIsStackedSplitDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [clampStackedSplitRatio, isStackedSplitDragging]);

  const isExpandedStackedLayout = expanded && !isDesktopViewport;
  const expandedPreviewShellClassName = expanded
    ? "flex-col lg:grid"
    : "flex-col";
  const expandedPreviewShellStyle = useMemo<CSSProperties | undefined>(
    () =>
      expanded
        ? {
            gridTemplateColumns:
              buildExpandedPreviewShellGridTemplate(desktopSplitRatio),
          }
        : undefined,
    [buildExpandedPreviewShellGridTemplate, desktopSplitRatio, expanded]
  );
  const previewPaneClassName = `flex min-h-0 min-w-0 flex-col overflow-hidden bg-surface ${
    isExpandedStackedLayout
      ? "shrink-0 grow-0 border-b-0"
      : "flex-1 border-b border-border lg:border-b-0 lg:border-r-0"
  }`;
  const previewPaneStyle = useMemo<CSSProperties | undefined>(
    () =>
      isExpandedStackedLayout
        ? {
            flexBasis: `${(stackedSplitRatio * 100).toFixed(2)}%`,
          }
        : undefined,
    [isExpandedStackedLayout, stackedSplitRatio]
  );
  const expandedReviewPaneClassName = isExpandedStackedLayout
    ? "shrink-0 grow-0 min-h-0 px-4 py-4 sm:px-6"
    : expanded
      ? "shrink-0 max-h-[min(52vh,520px)] px-6 py-4 max-md:px-4 lg:h-full lg:max-h-none lg:min-h-0"
      : "flex-[2] px-5 py-4";

  const getReviewPaneStyle = useCallback(
    (hasEditablePreview: boolean): CSSProperties | undefined => {
      if (!expanded) {
        return { height: getExpandedBottomPanelHeight(hasEditablePreview) };
      }

      if (isExpandedStackedLayout) {
        return {
          flexBasis: `${((1 - stackedSplitRatio) * 100).toFixed(2)}%`,
        };
      }

      return undefined;
    },
    [expanded, isExpandedStackedLayout, stackedSplitRatio]
  );

  const startDesktopSplitResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!expanded || !previewWorkspaceRef.current) return;

      const workspaceWidth =
        previewWorkspaceRef.current.getBoundingClientRect().width;
      resizeStateRef.current = {
        startClientX: event.clientX,
        startRatio: desktopSplitRatioRef.current,
        availableWidth: Math.max(
          workspaceWidth - IMPORT_WORKSPACE_RESIZER_WIDTH,
          1
        ),
      };
      setIsDesktopSplitDragging(true);
    },
    [expanded]
  );

  const startStackedSplitResize = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!expanded || !previewWorkspaceRef.current) return;

      const workspaceHeight =
        previewWorkspaceRef.current.getBoundingClientRect().height;
      stackedResizeStateRef.current = {
        startClientY: event.clientY,
        startRatio: stackedSplitRatioRef.current,
        availableHeight: Math.max(
          workspaceHeight - IMPORT_WORKSPACE_STACKED_RESIZER_HEIGHT,
          1
        ),
      };
      setIsStackedSplitDragging(true);
    },
    [expanded]
  );

  const nudgeDesktopSplit = useCallback(
    (delta: number) => {
      setDesktopSplitRatio((currentRatio) =>
        clampDesktopSplitRatio(currentRatio + delta)
      );
    },
    [clampDesktopSplitRatio]
  );

  const nudgeStackedSplit = useCallback(
    (delta: number) => {
      setStackedSplitRatio((currentRatio) =>
        clampStackedSplitRatio(currentRatio + delta)
      );
    },
    [clampStackedSplitRatio]
  );

  const resetDesktopSplit = useCallback(() => {
    setDesktopSplitRatio(
      clampDesktopSplitRatio(IMPORT_WORKSPACE_DEFAULT_RATIO)
    );
  }, [clampDesktopSplitRatio]);

  const resetStackedSplit = useCallback(() => {
    setStackedSplitRatio(
      clampStackedSplitRatio(IMPORT_WORKSPACE_STACKED_DEFAULT_RATIO)
    );
  }, [clampStackedSplitRatio]);

  const setDesktopSplitToMin = useCallback(() => {
    setDesktopSplitRatio(clampDesktopSplitRatio(IMPORT_WORKSPACE_MIN_RATIO));
  }, [clampDesktopSplitRatio]);

  const setDesktopSplitToMax = useCallback(() => {
    setDesktopSplitRatio(clampDesktopSplitRatio(IMPORT_WORKSPACE_MAX_RATIO));
  }, [clampDesktopSplitRatio]);

  const setStackedSplitToMin = useCallback(() => {
    setStackedSplitRatio(
      clampStackedSplitRatio(IMPORT_WORKSPACE_STACKED_MIN_RATIO)
    );
  }, [clampStackedSplitRatio]);

  const setStackedSplitToMax = useCallback(() => {
    setStackedSplitRatio(
      clampStackedSplitRatio(IMPORT_WORKSPACE_STACKED_MAX_RATIO)
    );
  }, [clampStackedSplitRatio]);

  return {
    previewWorkspaceRef,
    isDesktopSplitDragging,
    isStackedSplitDragging,
    isExpandedStackedLayout,
    expandedPreviewShellClassName,
    expandedPreviewShellStyle,
    previewPaneClassName,
    previewPaneStyle,
    expandedReviewPaneClassName,
    getReviewPaneStyle,
    startDesktopSplitResize,
    startStackedSplitResize,
    nudgeDesktopSplit,
    nudgeStackedSplit,
    resetDesktopSplit,
    resetStackedSplit,
    setDesktopSplitToMin,
    setDesktopSplitToMax,
    setStackedSplitToMin,
    setStackedSplitToMax,
  };
}
