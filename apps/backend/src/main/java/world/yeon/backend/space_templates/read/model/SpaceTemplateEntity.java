package world.yeon.backend.space_templates.read.model;

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
@Table(name = "space_templates", schema = "yeon_backend")
public class SpaceTemplateEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", nullable = false)
	private Long id;

	@Column(name = "public_id", nullable = false, unique = true)
	private String publicId;

	@Column(name = "created_by_user_id")
	private UUID createdByUserId;

	@Column(name = "name", nullable = false, length = 80)
	private String name;

	@Column(name = "description")
	private String description;

	@Column(name = "is_system", nullable = false)
	private boolean isSystem;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "tabs_config", nullable = false, columnDefinition = "jsonb")
	private JsonNode tabsConfig;

	@Column(name = "created_at", nullable = false)
	private OffsetDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private OffsetDateTime updatedAt;

	public SpaceTemplateEntity() {
	}

	public Long getId() {
		return id;
	}

	public String getPublicId() {
		return publicId;
	}

	public void setPublicId(String publicId) {
		this.publicId = publicId;
	}

	public UUID getCreatedByUserId() {
		return createdByUserId;
	}

	public void setCreatedByUserId(UUID createdByUserId) {
		this.createdByUserId = createdByUserId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public boolean isSystem() {
		return isSystem;
	}

	public void setSystem(boolean system) {
		isSystem = system;
	}

	public JsonNode getTabsConfig() {
		return tabsConfig;
	}

	public void setTabsConfig(JsonNode tabsConfig) {
		this.tabsConfig = tabsConfig;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public OffsetDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(OffsetDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
