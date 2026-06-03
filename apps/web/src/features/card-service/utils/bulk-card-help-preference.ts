import {
  dispatchYeonWindowCustomEvent,
  readYeonLocalStorageItem,
  removeYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export const BULK_CARD_HELP_STORAGE_KEY = "yeon.card-service.bulk-help.visible";
export const BULK_CARD_HELP_VISIBILITY_EVENT = "yeon:card-service-bulk-help";

export function shouldShowBulkCardHelp() {
  return readYeonLocalStorageItem(BULK_CARD_HELP_STORAGE_KEY) !== "hidden";
}

export function setBulkCardHelpVisible(isVisible: boolean) {
  if (isVisible) {
    removeYeonLocalStorageItem(BULK_CARD_HELP_STORAGE_KEY);
  } else {
    writeYeonLocalStorageItem(BULK_CARD_HELP_STORAGE_KEY, "hidden");
  }

  dispatchYeonWindowCustomEvent(BULK_CARD_HELP_VISIBILITY_EVENT, { isVisible });
}
