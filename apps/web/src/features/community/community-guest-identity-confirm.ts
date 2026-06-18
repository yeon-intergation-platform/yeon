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

export function canSkipCommunityGuestIdentityConfirm(
  identity: CommunityGuestIdentity
) {
  return hasCompleteCommunityGuestIdentity(identity);
}
