package world.yeon.backend.member_fields.bootstrap_overview.support;

import java.util.List;

public final class DefaultOverviewFields {

	public record FieldDef(
		String sourceKey,
		String name,
		String fieldType,
		int displayOrder
	) {}

	public static final List<FieldDef> DEFAULTS = List.of(
		new FieldDef("member_name", "이름", "text", 0),
		new FieldDef("member_email", "이메일", "email", 1),
		new FieldDef("member_phone", "전화번호", "phone", 2),
		new FieldDef("member_status", "수강 상태", "text", 3),
		new FieldDef("member_created_at", "등록일", "date", 4),
		new FieldDef("member_counseling_count", "연결된 상담", "number", 5),
		new FieldDef("member_memo_count", "운영 메모", "number", 6),
		new FieldDef("member_ai_risk_signals", "AI 위험 신호", "text", 7)
	);

	private DefaultOverviewFields() {
	}
}
