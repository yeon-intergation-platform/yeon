import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import {
  isParticipantTokenVerificationRequired,
  verifyParticipantToken,
} from "./card-room-participant-token";

const originalSecret = process.env.SPRING_INTERNAL_TOKEN;

function sign(secret: string, cardRoomId: string, participantId: string) {
  return createHmac("sha256", secret)
    .update(`${cardRoomId}.${participantId}`, "utf8")
    .digest("base64url");
}

afterEach(() => {
  process.env.SPRING_INTERNAL_TOKEN = originalSecret;
});

describe("card room participant token policy", () => {
  it("keeps local legacy mode open when the shared secret is absent", () => {
    delete process.env.SPRING_INTERNAL_TOKEN;

    expect(isParticipantTokenVerificationRequired()).toBe(false);
    expect(verifyParticipantToken("room-1", "participant-1", null)).toBe(true);
  });

  it("requires a matching HMAC token when the shared secret is configured", () => {
    process.env.SPRING_INTERNAL_TOKEN = "test-secret";
    const token = sign("test-secret", "room-1", "participant-1");

    expect(isParticipantTokenVerificationRequired()).toBe(true);
    expect(verifyParticipantToken("room-1", "participant-1", token)).toBe(true);
    expect(verifyParticipantToken("room-1", "participant-2", token)).toBe(
      false
    );
    expect(verifyParticipantToken("room-1", "participant-1", null)).toBe(false);
  });
});
