import {
  readYeonLocalStorageItem,
  writeYeonLocalStorageItem,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export const COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY =
  "yeon-community-guest-identity-confirm-dismissed";

export type CommunityGuestIdentity = {
  guestNickname: string;
  guestPassword: string;
};

export function hasCompleteCommunityGuestIdentity(
  identity: CommunityGuestIdentity
) {
  return Boolean(
    identity.guestNickname.trim() && identity.guestPassword.trim()
  );
}

export function isCommunityGuestIdentityConfirmDismissed() {
  return (
    readYeonLocalStorageItem(COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY) ===
    "true"
  );
}

export function persistCommunityGuestIdentityConfirmDismissed() {
  writeYeonLocalStorageItem(
    COMMUNITY_GUEST_IDENTITY_CONFIRM_DISMISSED_KEY,
    "true"
  );
}

export function canSkipCommunityGuestIdentityConfirm(
  identity: CommunityGuestIdentity
) {
  return (
    isCommunityGuestIdentityConfirmDismissed() &&
    hasCompleteCommunityGuestIdentity(identity)
  );
}
