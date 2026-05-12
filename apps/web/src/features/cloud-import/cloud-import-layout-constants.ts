export const IMPORT_WORKSPACE_SPLIT_STORAGE_KEY =
  "yeon:import-workspace:split-ratio";
export const IMPORT_WORKSPACE_DEFAULT_RATIO = 0.58;
export const IMPORT_WORKSPACE_MIN_RATIO = 0.32;
export const IMPORT_WORKSPACE_MAX_RATIO = 0.72;
export const IMPORT_WORKSPACE_RESIZER_WIDTH = 12;
export const IMPORT_WORKSPACE_MIN_LEFT_PANE_PX = 480;
export const IMPORT_WORKSPACE_MIN_RIGHT_PANE_PX = 380;
export const IMPORT_WORKSPACE_STACKED_SPLIT_STORAGE_KEY =
  "yeon:import-workspace:stacked-split-ratio";
export const IMPORT_WORKSPACE_STACKED_DEFAULT_RATIO = 0.54;
export const IMPORT_WORKSPACE_STACKED_MIN_RATIO = 0.34;
export const IMPORT_WORKSPACE_STACKED_MAX_RATIO = 0.72;
export const IMPORT_WORKSPACE_STACKED_RESIZER_HEIGHT = 20;
export const IMPORT_WORKSPACE_MIN_TOP_PANE_PX = 240;
export const IMPORT_WORKSPACE_MIN_BOTTOM_PANE_PX = 280;
export const IMPORT_WORKSPACE_DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
export const LOADING_FEEDBACK_DELAY_MS = 300;

export function getExpandedBottomPanelHeight(hasEditablePreview: boolean) {
  return hasEditablePreview
    ? "clamp(320px, 42vh, 520px)"
    : "clamp(220px, 28vh, 320px)";
}
