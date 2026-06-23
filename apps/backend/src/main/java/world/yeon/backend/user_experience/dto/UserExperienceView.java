package world.yeon.backend.user_experience.dto;

/**
 * 현재 유저의 레벨/경험치 진행도 표시용 응답.
 *
 * @param level 현재 레벨
 * @param totalXp 누적 경험치
 * @param xpIntoLevel 현재 레벨 진입 후 추가로 쌓은 경험치
 * @param xpForNextLevel 다음 레벨까지 필요한 총 경험치(현재 레벨 구간 크기)
 * @param points 현재 레벨까지 누적된 보상 포인트(레벨업당 1000P, 차감 없는 표시값)
 */
public record UserExperienceView(
    int level, long totalXp, long xpIntoLevel, long xpForNextLevel, long points) {}
