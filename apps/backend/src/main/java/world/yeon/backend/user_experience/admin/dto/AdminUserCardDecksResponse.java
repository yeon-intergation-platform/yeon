package world.yeon.backend.user_experience.admin.dto;

import java.util.List;

/** 어드민: 특정 유저가 만든 카드덱 목록. */
public record AdminUserCardDecksResponse(List<AdminCardDeckItem> cardDecks) {
  /**
   * @param id 카드덱 public id
   * @param title 제목
   * @param description 설명(없으면 null)
   * @param itemCount 카드 수
   * @param createdAt ISO-8601 생성 시각
   * @param updatedAt ISO-8601 수정 시각
   */
  public record AdminCardDeckItem(String id, String title, String description, int itemCount, String createdAt, String updatedAt) {}
}
