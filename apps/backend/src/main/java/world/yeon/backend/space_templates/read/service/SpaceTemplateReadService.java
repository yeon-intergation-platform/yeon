package world.yeon.backend.space_templates.read.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.stereotype.Service;

import world.yeon.backend.space_templates.read.dto.SpaceTemplateDetailResponse;
import world.yeon.backend.space_templates.read.dto.SpaceTemplateSummaryResponse;
import world.yeon.backend.space_templates.read.mapper.SpaceTemplateReadMapper;
import world.yeon.backend.space_templates.read.repository.SpaceTemplateReadRepository;

@Service
public class SpaceTemplateReadService {

	private final SpaceTemplateReadRepository repository;
	private final SpaceTemplateReadMapper mapper;

	public SpaceTemplateReadService(
		SpaceTemplateReadRepository repository,
		SpaceTemplateReadMapper mapper
	) {
		this.repository = repository;
		this.mapper = mapper;
	}

	public List<SpaceTemplateSummaryResponse> listTemplates(UUID userId) {
		return repository.findByIsSystemFalseAndCreatedByUserIdOrderByCreatedAtAsc(userId)
			.stream()
			.map(mapper::toSummary)
			.toList();
	}

	public SpaceTemplateDetailResponse getTemplateDetail(
		String templatePublicId,
		UUID userId
	) {
		return repository.findAccessibleTemplate(templatePublicId, userId)
			.map(mapper::toDetail)
			.orElseThrow(() -> new NoSuchElementException("템플릿을 찾지 못했습니다."));
	}
}
