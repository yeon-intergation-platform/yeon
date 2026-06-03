"use client";
import {
  getYeonDocumentTitle,
  getYeonGtag,
  getYeonLocationOrigin,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export const GA_MEASUREMENT_ID = "G-YGRNS3PQBQ";

export const analyticsEvents = {
  serviceEntryClick: "service_entry_click",
  loginModalOpen: "login_modal_open",
  loginProviderClick: "login_provider_click",
  loginSecondaryClick: "login_secondary_click",
  credentialLoginSubmit: "credential_login_submit",
  loginSuccess: "login",
  typingHomeCtaClick: "typing_home_cta_click",
  typingDeckCreateOpen: "typing_deck_create_open",
  typingDeckCreated: "typing_deck_created",
  typingDeckOpen: "typing_deck_open",
  typingPracticeSelect: "typing_practice_select",
  typingPracticeStart: "typing_practice_start",
  typingPracticeComplete: "typing_practice_complete",
  typingRoomCreateOpen: "typing_room_create_open",
  typingRoomCreateSubmit: "typing_room_create_submit",
  typingRoomCreated: "typing_room_created",
  typingRoomJoinClick: "typing_room_join_click",
  typingRoomJoined: "typing_room_joined",
  typingRoomInviteCopy: "typing_room_invite_copy",
  cardDeckCreateOpen: "card_deck_create_open",
  cardDeckCreateSubmit: "card_deck_create_submit",
  cardDeckCreated: "card_deck_created",
  cardDeckOpen: "card_deck_open",
  cardStudyStart: "card_study_start",
  cardAddOpen: "card_add_open",
  cardCreated: "card_created",
} as const;

type AnalyticsScalar = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsScalar>;

function normalizeParams(params?: AnalyticsParams) {
  if (!params) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
}

export function trackEvent(eventName: string, params?: AnalyticsParams): void {
  const gtag = getYeonGtag();
  if (!gtag) {
    return;
  }

  gtag("event", eventName, normalizeParams(params));
}

export function trackPageView(path: string): void {
  const gtag = getYeonGtag();
  if (!gtag) {
    return;
  }

  gtag("event", "page_view", {
    page_title: getYeonDocumentTitle(),
    page_path: path,
    page_location: `${getYeonLocationOrigin()}${path}`,
  });
}
