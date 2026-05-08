package world.yeon.backend.member_tabs.read.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "member_tab_definitions", schema = "public")
public class MemberTabDefinitionEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Long id;

	@Column(name = "public_id", nullable = false, unique = true)
	private String publicId;

	@Column(name = "space_id", nullable = false)
	private Long spaceId;

	@Column(name = "created_by_user_id")
	private UUID createdByUserId;

	@Column(name = "tab_type", nullable = false, length = 20)
	private String tabType;

	@Column(name = "system_key", length = 30)
	private String systemKey;

	@Column(name = "name", nullable = false, length = 80)
	private String name;

	@Column(name = "is_visible", nullable = false)
	private boolean isVisible;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;

	public MemberTabDefinitionEntity() {
	}

	public Long getId() {
		return id;
	}

	public String getPublicId() {
		return publicId;
	}

	public Long getSpaceId() {
		return spaceId;
	}

	public UUID getCreatedByUserId() {
		return createdByUserId;
	}

	public String getTabType() {
		return tabType;
	}

	public String getSystemKey() {
		return systemKey;
	}

	public String getName() {
		return name;
	}

	public boolean isVisible() {
		return isVisible;
	}

	public int getDisplayOrder() {
		return displayOrder;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}


	public void setPublicId(String publicId) {
		this.publicId = publicId;
	}

	public void setSpaceId(Long spaceId) {
		this.spaceId = spaceId;
	}

	public void setCreatedByUserId(UUID createdByUserId) {
		this.createdByUserId = createdByUserId;
	}

	public void setTabType(String tabType) {
		this.tabType = tabType;
	}

	public void setSystemKey(String systemKey) {
		this.systemKey = systemKey;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setVisible(boolean visible) {
		isVisible = visible;
	}

	public void setDisplayOrder(int displayOrder) {
		this.displayOrder = displayOrder;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(OffsetDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
