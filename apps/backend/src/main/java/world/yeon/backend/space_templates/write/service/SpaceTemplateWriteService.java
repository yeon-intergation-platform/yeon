package world.yeon.backend.space_templates.write.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.space_access.service.SpaceAccessService;
import world.yeon.backend.space_templates.read.dto.SpaceTemplateSummaryResponse;
import world.yeon.backend.space_templates.read.mapper.SpaceTemplateReadMapper;
import world.yeon.backend.space_templates.read.model.SpaceTemplateEntity;
import world.yeon.backend.space_templates.write.dto.ApplySpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.CreateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.SnapshotSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.UpdateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.repository.SpaceTemplateApplyRepository;
import world.yeon.backend.space_templates.write.repository.SpaceTemplateSnapshotQueryRepository;
import world.yeon.backend.space_templates.write.repository.SpaceTemplateWriteRepository;

@Service
public class SpaceTemplateWriteService {

	private final SpaceTemplateWriteRepository repository;
	private final SpaceTemplateSnapshotQueryRepository snapshotQueryRepository;
	private final SpaceTemplateApplyRepository applyRepository;
	private final SpaceTemplateReadMapper mapper;
	private final SpaceAccessService spaceAccessService;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public SpaceTemplateWriteService(
		SpaceTemplateWriteRepository repository,
		SpaceTemplateSnapshotQueryRepository snapshotQueryRepository,
		SpaceTemplateApplyRepository applyRepository,
		SpaceTemplateReadMapper mapper,
		SpaceAccessService spaceAccessService
	) {
		this.repository = repository;
		this.snapshotQueryRepository = snapshotQueryRepository;
		this.applyRepository = applyRepository;
		this.mapper = mapper;
		this.spaceAccessService = spaceAccessService;
	}

	@Transactional
	public SpaceTemplateSummaryResponse createTemplate(
		UUID userId,
		CreateSpaceTemplateRequest request
	) {
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		SpaceTemplateEntity template = new SpaceTemplateEntity();
		template.setPublicId(generatePublicId());
		template.setCreatedByUserId(userId);
		template.setName(normalizeName(request.name()));
		template.setDescription(normalizeDescription(request.description()));
		template.setSystem(false);
		template.setTabsConfig(objectMapper.valueToTree(request.tabsConfig()));
		template.setCreatedAt(now);
		template.setUpdatedAt(now);

		return mapper.toSummary(repository.save(template));
	}

	@Transactional
	public SpaceTemplateSummaryResponse updateTemplate(
		String templateId,
		UUID userId,
		UpdateSpaceTemplateRequest request
	) {
		SpaceTemplateEntity template = requireWritableTemplate(templateId, userId);
		template.setUpdatedAt(OffsetDateTime.now(ZoneOffset.UTC));

		if (request.name() != null) {
			template.setName(normalizeName(request.name()));
		}

		if (request.description() != null) {
			template.setDescription(normalizeDescription(request.description()));
		}

		return mapper.toSummary(repository.save(template));
	}

	@Transactional
	public void deleteTemplate(String templateId, UUID userId) {
		SpaceTemplateEntity template = requireWritableTemplate(templateId, userId);
		repository.delete(template);
	}

	@Transactional
	public SpaceTemplateSummaryResponse duplicateTemplate(String templateId, UUID userId) {
		SpaceTemplateEntity template = repository.findAccessibleTemplate(templateId, userId)
			.orElseThrow(() -> new NoSuchElementException("템플릿을 찾지 못했습니다."));

		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		SpaceTemplateEntity duplicated = new SpaceTemplateEntity();
		duplicated.setPublicId(generatePublicId());
		duplicated.setCreatedByUserId(userId);
		duplicated.setName(normalizeName(template.getName() + " 복사본"));
		duplicated.setDescription(normalizeDescription(template.getDescription()));
		duplicated.setSystem(false);
		duplicated.setTabsConfig(template.getTabsConfig().deepCopy());
		duplicated.setCreatedAt(now);
		duplicated.setUpdatedAt(now);

		return mapper.toSummary(repository.save(duplicated));
	}

	@Transactional
	public SpaceTemplateSummaryResponse snapshotSpaceAsTemplate(
		String spaceId,
		UUID userId,
		SnapshotSpaceTemplateRequest request
	) {
		// IDOR 방지: 소유자만 자기 스페이스를 스냅샷할 수 있다(미소유 시 NoSuchElementException).
		spaceAccessService.requireOwnedSpace(spaceId, userId);

		var tabs = snapshotQueryRepository.loadTabs(spaceId).stream()
			.map(tab -> new CreateSpaceTemplateRequest.TemplateTabRequest(
				tab.name(),
				tab.tabType(),
				tab.systemKey(),
				tab.displayOrder(),
				snapshotQueryRepository.loadFields(spaceId, tab.name(), tab.displayOrder()).stream()
					.map(field -> new CreateSpaceTemplateRequest.TemplateFieldRequest(
						field.name(),
						field.fieldType(),
						field.options() == null
							? null
							: field.options().stream()
								.map(option -> new CreateSpaceTemplateRequest.TemplateFieldOptionRequest(
									option.value(),
									option.color()
								))
								.toList(),
						field.isRequired(),
						field.displayOrder()
					))
					.toList()
			))
			.toList();

		return createTemplate(
			userId,
			new CreateSpaceTemplateRequest(request.name(), request.description(), tabs)
		);
	}

	@Transactional
	public void applyTemplateToSpace(String templateId, String spaceId, UUID userId) {
		// IDOR 방지: 타인 스페이스 필드 정의/탭 삭제(cascade)를 막기 위해 소유권을 먼저 검증한다.
		spaceAccessService.requireOwnedSpace(spaceId, userId);
		Long spaceInternalId = applyRepository.requireSpaceInternalId(spaceId);
		SpaceTemplateEntity template = repository.findAccessibleTemplate(templateId, userId)
			.orElseThrow(() -> new NoSuchElementException("템플릿을 찾지 못했습니다."));

		CreateSpaceTemplateRequest.TemplateTabRequest[] tabs = objectMapper.convertValue(
			template.getTabsConfig(),
			CreateSpaceTemplateRequest.TemplateTabRequest[].class
		);

		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		ensureSystemTabs(spaceInternalId, userId, List.of(tabs), now);
		applyRepository.deleteAllFieldDefinitions(spaceInternalId);
		applyRepository.deleteCustomTabs(spaceInternalId);

		for (CreateSpaceTemplateRequest.TemplateTabRequest tab : tabs) {
			if ("system".equals(tab.tabType()) && tab.systemKey() != null && !tab.systemKey().isBlank()) {
				Long tabId;
				try {
					tabId = applyRepository.findSystemTabId(spaceInternalId, tab.systemKey());
				} catch (org.springframework.dao.EmptyResultDataAccessException missing) {
					// ensureSystemTabs 선행에도 시스템 탭이 없으면(비표준 systemKey 등) 트랜잭션 500 대신 명시적 예외로 처리.
					throw new NoSuchElementException("시스템 탭을 찾지 못했습니다: " + tab.systemKey());
				}
				if (tabId == null) {
					throw new NoSuchElementException("시스템 탭을 찾지 못했습니다: " + tab.systemKey());
				}
				applyRepository.updateSystemTab(tabId, tab.name(), tab.displayOrder(), now);
				insertFields(tabId, spaceInternalId, userId, tab.fields(), now);
			} else {
				Long tabId = applyRepository.insertCustomTab(
					generatePrefixedId("mtb"),
					spaceInternalId,
					userId,
					tab.name(),
					tab.displayOrder(),
					now
				);
				insertFields(tabId, spaceInternalId, userId, tab.fields(), now);
			}
		}
	}

	private SpaceTemplateEntity requireWritableTemplate(String templateId, UUID userId) {
		SpaceTemplateEntity template = repository.findByPublicId(templateId)
			.orElseThrow(() -> new NoSuchElementException("템플릿을 찾지 못했습니다."));

		if (template.isSystem()) {
			throw new IllegalStateException("시스템 템플릿은 수정할 수 없습니다.");
		}

		if (!userId.equals(template.getCreatedByUserId())) {
			throw new NoSuchElementException("템플릿을 찾지 못했습니다.");
		}

		return template;
	}

	private String normalizeName(String name) {
		String normalized = name.trim();
		if (normalized.isEmpty()) {
			throw new IllegalArgumentException("템플릿 이름은 필수입니다.");
		}
		return normalized.length() > 80 ? normalized.substring(0, 80) : normalized;
	}

	private String normalizeDescription(String description) {
		if (description == null) {
			return null;
		}
		String normalized = description.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		return normalized.length() > 500 ? normalized.substring(0, 500) : normalized;
	}

	private String generatePublicId() {
		return generatePrefixedId("tpl");
	}

	private void ensureSystemTabs(
		Long spaceInternalId,
		UUID userId,
		List<CreateSpaceTemplateRequest.TemplateTabRequest> tabs,
		OffsetDateTime now
	) {
		for (CreateSpaceTemplateRequest.TemplateTabRequest tab : tabs) {
			if (!"system".equals(tab.tabType()) || tab.systemKey() == null || tab.systemKey().isBlank()) {
				continue;
			}
			applyRepository.ensureSystemTab(
				generatePrefixedId("mtb"),
				spaceInternalId,
				userId,
				tab.systemKey(),
				tab.name(),
				tab.displayOrder(),
				now
			);
		}
	}

	private void insertFields(
		Long tabId,
		Long spaceInternalId,
		UUID userId,
		List<CreateSpaceTemplateRequest.TemplateFieldRequest> fields,
		OffsetDateTime now
	) {
		for (CreateSpaceTemplateRequest.TemplateFieldRequest field : fields) {
			String optionsJson = field.options() == null ? null : writeJson(field.options());
			applyRepository.insertField(
				generatePrefixedId("mfd"),
				spaceInternalId,
				userId,
				tabId,
				field.name(),
				field.fieldType(),
				optionsJson,
				field.isRequired(),
				field.displayOrder(),
				now
			);
		}
	}

	private String writeJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (Exception error) {
			throw new IllegalArgumentException("템플릿 설정을 직렬화하지 못했습니다.", error);
		}
	}

	private String generatePrefixedId(String prefix) {
		String body = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
		return prefix + "_" + body;
	}
}
