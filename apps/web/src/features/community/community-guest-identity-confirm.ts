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

export async function runCommunityGuestIdentityAction(
  identity: CommunityGuestIdentity,
  run: (identity: CommunityGuestIdentity) => Promise<void>
) {
  try {
    await run(identity);
    return true;
  } catch {
    return false;
  }
}
