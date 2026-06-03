import { createHmac, timingSafeEqual } from "node:crypto";

// finding 166: race-server는 클라이언트가 보낸 임의 participantId를 검증 없이 신뢰하면 안 된다.
// 백엔드(Spring)가 입장 REST 응답에서 (roomId, participantId)에 묶인 HMAC-SHA256 토큰을
// 발급하고, race-server가 동일 시크릿(SPRING_INTERNAL_TOKEN)으로 재계산해 비교하면
// 위조가 불가능하다. 시크릿/엔드포인트는 이미 공유되므로 별도 DB·마이그레이션이 없다.

function resolveSecret(): string {
  return process.env.SPRING_INTERNAL_TOKEN?.trim() ?? "";
}

// 시크릿이 설정돼 있으면 토큰 검증을 강제한다. 미설정(로컬/레거시) 환경에서는 백엔드도
// 토큰을 발급하지 않으므로 검증을 건너뛴다(백엔드와 동일한 trust 경계).
export function isParticipantTokenVerificationRequired(): boolean {
  return resolveSecret().length > 0;
}

function signParticipantToken(
  secret: string,
  cardRoomId: string,
  participantId: string
): string {
  // 백엔드 CardRoomParticipantTokenService와 정확히 동일한 payload/인코딩을 사용한다.
  const payload = `${cardRoomId}.${participantId}`;
  return createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64url");
}

/**
 * 토큰이 (cardRoomId, participantId) 소유를 증명하는지 검증한다.
 * 시크릿 미설정 환경에서는 항상 true(검증 비활성).
 */
export function verifyParticipantToken(
  cardRoomId: string,
  participantId: string,
  token: string | undefined | null
): boolean {
  const secret = resolveSecret();
  if (secret.length === 0) {
    return true;
  }
  if (typeof token !== "string" || token.length === 0) {
    return false;
  }
  const expected = signParticipantToken(secret, cardRoomId, participantId);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(token);
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, providedBuffer);
}
