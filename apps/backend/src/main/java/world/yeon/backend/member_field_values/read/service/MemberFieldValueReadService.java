package world.yeon.backend.member_field_values.read.service;

import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_field_values.read.dto.MemberFieldValueDetailedItemResponse;
import world.yeon.backend.member_field_values.read.dto.MemberFieldValueDetailedListResponse;
import world.yeon.backend.member_field_values.read.dto.MemberFieldValueItemResponse;
import world.yeon.backend.member_field_values.read.dto.MemberFieldValueListResponse;
import world.yeon.backend.member_field_values.read.repository.MemberFieldValueReadRepository;

@Service
public class MemberFieldValueReadService {

	private final MemberFieldValueReadRepository repository;
	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public MemberFieldValueReadService(MemberFieldValueReadRepository repository) {
		this.repository = repository;
	}

	public MemberFieldValueDetailedListResponse listMemberValues(String spacePublicId, String memberPublicId, java.util.List<String> fieldDefinitionPublicIds) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		Long memberInternalId = repository.findMemberInternalId(memberPublicId, spaceInternalId);
		if (memberInternalId == null) {
			throw new NoSuchElementException("수강생을 찾지 못했습니다.");
		}
		var values = repository.findDetailedValues(memberInternalId, spaceInternalId, fieldDefinitionPublicIds)
			.stream()
			.map(value -> new MemberFieldValueDetailedItemResponse(
				value.fieldDefinitionPublicId(),
				value.fieldType(),
				value.fieldName(),
				value.valueText(),
				value.valueNumber(),
				value.valueBoolean(),
				value.valueJson() == null ? null : objectMapper.convertValue(value.valueJson(), Object.class)
			))
			.toList();
		return new MemberFieldValueDetailedListResponse(values);
	}

	public MemberFieldValueListResponse listValues(String spacePublicId, String tabPublicId, String memberPublicId) {
		Long spaceInternalId = repository.findSpaceInternalId(spacePublicId);
		if (spaceInternalId == null) {
			throw new NoSuchElementException("스페이스를 찾지 못했습니다.");
		}
		MemberFieldValueReadRepository.TabLookup tabLookup = repository.findTabLookup(tabPublicId);
		if (tabLookup == null) {
			throw new NoSuchElementException("탭을 찾지 못했습니다.");
		}
		if (!spaceInternalId.equals(tabLookup.spaceInternalId())) {
			throw new IllegalArgumentException("탭이 스페이스에 속하지 않습니다.");
		}
		Long memberInternalId = repository.findMemberInternalId(memberPublicId, spaceInternalId);
		if (memberInternalId == null) {
			throw new NoSuchElementException("수강생을 찾지 못했습니다.");
		}
		var fieldDefinitionIds = repository.findFieldDefinitionIds(spaceInternalId, tabLookup.tabInternalId());
		var values = repository.findValues(memberInternalId, spaceInternalId, fieldDefinitionIds)
			.stream()
			.map(value -> new MemberFieldValueItemResponse(
				value.fieldDefinitionPublicId(),
				value.valueText(),
				value.valueNumber(),
				value.valueBoolean(),
				value.valueJson() == null ? null : objectMapper.convertValue(value.valueJson(), Object.class)
			))
			.toList();
		return new MemberFieldValueListResponse(values);
	}
}
