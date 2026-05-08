package world.yeon.backend.member_fields.write.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;
import world.yeon.backend.member_fields.write.dto.CreateMemberFieldRequest;
import world.yeon.backend.member_fields.write.dto.UpdateMemberFieldRequest;
import world.yeon.backend.member_fields.write.repository.MemberFieldWriteRepository;

@Service
@Profile("jdbc")
public class MemberFieldWriteService {

	private static final Set<String> VALID_FIELD_TYPES = Set.of(
		"text", "long_text", "number", "date", "select", "multi_select", "checkbox", "url", "email", "phone"
	);

	private final MemberFieldWriteRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public MemberFieldWriteService(MemberFieldWriteRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public MemberFieldDefinitionEntity create(String spacePublicId, String tabPublicId, UUID userId, CreateMemberFieldRequest data) {
		String name = normalizeName(data.name());
		validateFieldType(data.fieldType());
		Long spaceInternalId = requireSpaceInternalId(spacePublicId);
		var tabLookup = repository.findTabLookup(tabPublicId);
		if (tabLookup == null) {
			throw new MemberFieldWriteServiceException(404, "탭을 찾지 못했습니다.", "TAB_NOT_FOUND");
		}
		int maxOrder = repository.findMaxDisplayOrder(spaceInternalId, tabLookup.tabInternalId());
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		MemberFieldDefinitionEntity entity = new MemberFieldDefinitionEntity();
		entity.setPublicId("mfd_" + UUID.randomUUID());
		entity.setSpaceId(spaceInternalId);
		entity.setCreatedByUserId(userId);
		entity.setTabId(tabLookup.tabInternalId());
		entity.setName(name);
		entity.setSourceKey(null);
		entity.setFieldType(data.fieldType());
		entity.setOptions(resolveOptions(data.fieldType(), data.options()));
		entity.setRequired(Boolean.TRUE.equals(data.isRequired()));
		entity.setDisplayOrder(maxOrder + 1);
		entity.setCreatedAt(now);
		entity.setUpdatedAt(now);
		MemberFieldDefinitionEntity saved = repository.save(entity);
		if (saved == null) {
			throw new MemberFieldWriteServiceException(500, "필드를 생성하지 못했습니다.", "FIELD_CREATE_FAILED");
		}
		return saved;
	}

	@Transactional
	public MemberFieldDefinitionEntity update(String fieldPublicId, String spacePublicId, UpdateMemberFieldRequest data) {
		Long spaceInternalId = requireSpaceInternalId(spacePublicId);
		MemberFieldDefinitionEntity existing = repository.findFieldByPublicIdInSpace(fieldPublicId, spaceInternalId);
		if (existing == null || existing.getDeletedAt() != null) {
			throw new MemberFieldWriteServiceException(404, "필드를 찾지 못했습니다.", "FIELD_NOT_FOUND");
		}

		Long nextTabInternalId = null;
		if (data.tabId() != null) {
			var tabLookup = repository.findTabLookup(data.tabId());
			if (tabLookup == null) {
				throw new MemberFieldWriteServiceException(404, "탭을 찾지 못했습니다.", "TAB_NOT_FOUND");
			}
			nextTabInternalId = tabLookup.tabInternalId();
		}

		if (existing.getSourceKey() != null) {
			boolean invalidProtectedMutation =
				(data.fieldType() != null && !data.fieldType().equals(existing.getFieldType())) ||
				data.options() != null ||
				(data.isRequired() != null && data.isRequired() != existing.isRequired()) ||
				(nextTabInternalId != null && !nextTabInternalId.equals(existing.getTabId()));
			if (invalidProtectedMutation) {
				throw new MemberFieldWriteServiceException(403, "기본 항목은 이름과 순서만 변경할 수 있습니다.", "FIELD_PROTECTED");
			}
		}

		if (data.name() != null) existing.setName(normalizeName(data.name()));
		if (data.fieldType() != null) {
			validateFieldType(data.fieldType());
			existing.setFieldType(data.fieldType());
			if (!needsOptions(data.fieldType())) {
				existing.setOptions(null);
			}
		}
		if (data.options() != null) existing.setOptions(resolveOptions(data.fieldType() != null ? data.fieldType() : existing.getFieldType(), data.options()));
		if (data.isRequired() != null) existing.setRequired(data.isRequired());
		if (data.displayOrder() != null) existing.setDisplayOrder(data.displayOrder());
		if (nextTabInternalId != null) existing.setTabId(nextTabInternalId);
		existing.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
		return repository.save(existing);
	}

	@Transactional
	public void delete(String fieldPublicId, String spacePublicId) {
		Long spaceInternalId = requireSpaceInternalId(spacePublicId);
		MemberFieldDefinitionEntity existing = repository.findFieldByPublicIdInSpace(fieldPublicId, spaceInternalId);
		if (existing == null || existing.getDeletedAt() != null) {
			throw new MemberFieldWriteServiceException(404, "필드를 찾지 못했습니다.", "FIELD_NOT_FOUND");
		}
		existing.setDeletedAt(OffsetDateTime.now(ZoneOffset.UTC));
		existing.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));
		repository.save(existing);
	}

	private Long requireSpaceInternalId(String spacePublicId) {
		Long id = repository.findSpaceInternalId(spacePublicId);
		if (id == null) {
			throw new MemberFieldWriteServiceException(404, "스페이스를 찾지 못했습니다.", "SPACE_NOT_FOUND");
		}
		return id;
	}

	private String normalizeName(String raw) {
		String name = raw == null ? "" : raw.trim();
		if (name.isEmpty()) {
			throw new MemberFieldWriteServiceException(400, "필드 이름은 필수입니다.", "INVALID_REQUEST");
		}
		return name.length() > 80 ? name.substring(0, 80) : name;
	}

	private void validateFieldType(String fieldType) {
		if (!VALID_FIELD_TYPES.contains(fieldType)) {
			throw new MemberFieldWriteServiceException(400, "지원하지 않는 필드 타입입니다.", "INVALID_REQUEST");
		}
	}

	private boolean needsOptions(String fieldType) {
		return "select".equals(fieldType) || "multi_select".equals(fieldType);
	}

	private JsonNode resolveOptions(String fieldType, List<java.util.Map<String, String>> options) {
		if (!needsOptions(fieldType)) return null;
		if (options == null) return null;
		return objectMapper.valueToTree(options);
	}
}
