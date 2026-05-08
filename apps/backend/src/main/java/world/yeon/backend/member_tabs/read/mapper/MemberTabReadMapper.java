package world.yeon.backend.member_tabs.read.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import world.yeon.backend.member_tabs.read.dto.MemberTabItemResponse;
import world.yeon.backend.member_tabs.read.dto.MemberTabListResponse;
import world.yeon.backend.member_tabs.read.model.MemberTabDefinitionEntity;

@Component
public class MemberTabReadMapper {

	public MemberTabItemResponse toItem(MemberTabDefinitionEntity entity) {
		return new MemberTabItemResponse(
			entity.getPublicId(),
			entity.getName(),
			entity.getTabType(),
			entity.getSystemKey(),
			entity.isVisible(),
			entity.getDisplayOrder()
		);
	}

	public MemberTabListResponse toList(List<MemberTabDefinitionEntity> entities) {
		return new MemberTabListResponse(
			entities.stream().map(this::toItem).toList()
		);
	}
}
