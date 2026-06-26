export type CommunityGuestIdentity = {
  guestNickname: string;
  guestPassword: string;
};

export type CommunityGuestIdentityInput = Partial<CommunityGuestIdentity>;
export type PendingCommunityGuestIdentityAction = {
  actionLabel: string;
  run: (identity: CommunityGuestIdentity) => Promise<void>;
  resolve: (completed: boolean) => void;
} | null;

export function normalizeCommunityGuestIdentity(
  identity: CommunityGuestIdentityInput
): CommunityGuestIdentity {
  return {
    guestNickname: identity.guestNickname?.trim() ?? "",
    guestPassword: identity.guestPassword?.trim() ?? "",
  };
}

export function hasCompleteCommunityGuestIdentity(
  identity: CommunityGuestIdentityInput
) {
  const normalized = normalizeCommunityGuestIdentity(identity);

  return Boolean(normalized.guestNickname && normalized.guestPassword);
}

export function canSkipCommunityGuestIdentityConfirm(
  identity: CommunityGuestIdentityInput
) {
  return hasCompleteCommunityGuestIdentity(identity);
}

export function resolveCommunityGuestActorPayload(
  identity: CommunityGuestIdentityInput
) {
  const normalized = normalizeCommunityGuestIdentity(identity);

  return hasCompleteCommunityGuestIdentity(normalized) ? normalized : {};
}

export async function runCommunityGuestIdentityAction(
  identity: CommunityGuestIdentity,
  run: (identity: CommunityGuestIdentity) => Promise<void>
) {
  try {
    const normalized = normalizeCommunityGuestIdentity(identity);
    if (!hasCompleteCommunityGuestIdentity(normalized)) {
      return false;
    }

    await run(normalized);
    return true;
  } catch {
    return false;
  }
}

export function runOrQueueCommunityGuestIdentityAction({
  actionLabel,
  identity,
  queue,
  run,
}: {
  actionLabel: string;
  identity: CommunityGuestIdentityInput;
  queue: (action: Exclude<PendingCommunityGuestIdentityAction, null>) => void;
  run: (identity: CommunityGuestIdentity) => Promise<void>;
}) {
  if (canSkipCommunityGuestIdentityConfirm(identity)) {
    return runCommunityGuestIdentityAction(
      normalizeCommunityGuestIdentity(identity),
      run
    );
  }

  return new Promise<boolean>((resolve) => {
    queue({
      actionLabel,
      run,
      resolve,
    });
  });
}
