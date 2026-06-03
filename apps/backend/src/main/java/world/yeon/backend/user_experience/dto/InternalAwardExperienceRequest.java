package world.yeon.backend.user_experience.dto;

import java.util.UUID;

/**
 * 내부 서비스(race-server 등)가 경험치 적립을 요청할 때 보내는 본문.
 *
 * @param userId 적립 대상 유저 id (필수, 신뢰 가능한 식별자여야 한다)
 * @param activityType 적립 활동 키 (화이트리스트로 제한 — 임의 적립 차단)
 * @param referenceId 멱등 키 참조 식별자 (예: 레이스 id + userId)
 */
public record InternalAwardExperienceRequest(UUID userId, String activityType, String referenceId) {}
