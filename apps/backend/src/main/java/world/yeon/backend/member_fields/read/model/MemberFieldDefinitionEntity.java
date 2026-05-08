package world.yeon.backend.member_fields.read.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "member_field_definitions", schema = "public")
public class MemberFieldDefinitionEntity {

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

	@Column(name = "tab_id", nullable = false)
	private Long tabId;

	@Column(name = "name", nullable = false, length = 80)
	private String name;

	@Column(name = "source_key", length = 50)
	private String sourceKey;

	@Column(name = "field_type", nullable = false, length = 30)
	private String fieldType;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "options", columnDefinition = "jsonb")
	private JsonNode options;

	@Column(name = "is_required", nullable = false)
	private boolean isRequired;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	@Column(name = "deleted_at")
	private OffsetDateTime deletedAt;

	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;

	public MemberFieldDefinitionEntity() {
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

	public Long getTabId() {
		return tabId;
	}

	public String getName() {
		return name;
	}

	public String getSourceKey() {
		return sourceKey;
	}

	public String getFieldType() {
		return fieldType;
	}

	public JsonNode getOptions() {
		return options;
	}

	public boolean isRequired() {
		return isRequired;
	}

	public int getDisplayOrder() {
		return displayOrder;
	}

	public OffsetDateTime getDeletedAt() {
		return deletedAt;
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

	public void setTabId(Long tabId) {
		this.tabId = tabId;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setSourceKey(String sourceKey) {
		this.sourceKey = sourceKey;
	}

	public void setFieldType(String fieldType) {
		this.fieldType = fieldType;
	}

	public void setOptions(JsonNode options) {
		this.options = options;
	}

	public void setRequired(boolean required) {
		isRequired = required;
	}

	public void setDisplayOrder(int displayOrder) {
		this.displayOrder = displayOrder;
	}

	public void setDeletedAt(OffsetDateTime deletedAt) {
		this.deletedAt = deletedAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public void setUpdatedAt(OffsetDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
