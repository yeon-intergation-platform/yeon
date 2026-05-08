package world.yeon.backend.member_fields.read.mapper;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import world.yeon.backend.member_fields.read.dto.MemberFieldItemResponse;
import world.yeon.backend.member_fields.read.dto.MemberFieldListResponse;
import world.yeon.backend.member_fields.read.model.MemberFieldDefinitionEntity;

@Component
public class MemberFieldReadMapper {

	private static final TypeReference<List<Map<String, String>>> OPTION_LIST_TYPE = new TypeReference<>() {
	};

	private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

	public MemberFieldListResponse toList(List<MemberFieldDefinitionEntity> fields) {
		return new MemberFieldListResponse(fields.stream().map(this::toItem).toList());
	}

	public MemberFieldItemResponse toItem(MemberFieldDefinitionEntity entity) {
		return new MemberFieldItemResponse(
			entity.getPublicId(),
			entity.getName(),
			entity.getSourceKey(),
			entity.getFieldType(),
			parseOptions(entity.getOptions()),
			entity.isRequired(),
			entity.getDisplayOrder()
		);
	}

	private List<Map<String, String>> parseOptions(JsonNode options) {
		if (options == null || options.isNull()) {
			return null;
		}
		List<Map<String, String>> converted = objectMapper.convertValue(options, OPTION_LIST_TYPE);
		return converted == null ? Collections.emptyList() : converted;
	}
}
