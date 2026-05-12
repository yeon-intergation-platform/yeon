package world.yeon.backend.typing_character_frames.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.typing_character_frames.dto.TypingCharacterFrameSlotResponse;

@Repository
public class TypingCharacterFrameRepository {
	public record OverrideRow(String characterId, List<TypingCharacterFrameSlotResponse> frameSlots) {}
	public record UserAdminRow(String email, String role) {}

	private static final TypeReference<List<TypingCharacterFrameSlotResponse>> FRAME_SLOTS_TYPE = new TypeReference<>() {};
	private final EntityManager entityManager;
	private final ObjectMapper objectMapper = new ObjectMapper();

	public TypingCharacterFrameRepository(EntityManager entityManager) {
		this.entityManager = entityManager;
	}

	public List<OverrideRow> listOverrides() {
		return entityManager.createNativeQuery("""
			select character_id, frame_slots
			from public.typing_character_frame_overrides
			order by character_id asc
			""")
			.getResultList()
			.stream()
			.map(this::toOverrideRow)
			.toList();
	}

	public UserAdminRow findUserAdminRow(UUID userId) {
		List<?> rows = entityManager.createNativeQuery("""
			select email, role
			from public.users
			where id = :userId
			limit 1
			""")
			.setParameter("userId", userId)
			.getResultList();
		return rows.isEmpty() ? null : toUserAdminRow(rows.getFirst());
	}

	@Transactional
	public OverrideRow upsertOverride(String characterId, List<TypingCharacterFrameSlotResponse> frameSlots, UUID updatedByUserId) {
		List<?> rows = entityManager.createNativeQuery("""
			insert into public.typing_character_frame_overrides (character_id, frame_slots, updated_by_user_id, updated_at)
			values (:characterId, cast(:frameSlots as jsonb), :updatedByUserId, now())
			on conflict (character_id) do update set
			  frame_slots = excluded.frame_slots,
			  updated_by_user_id = excluded.updated_by_user_id,
			  updated_at = now()
			returning character_id, frame_slots
			""")
			.setParameter("characterId", characterId)
			.setParameter("frameSlots", writeJson(frameSlots))
			.setParameter("updatedByUserId", updatedByUserId)
			.getResultList();
		return rows.isEmpty() ? null : toOverrideRow(rows.getFirst());
	}

	@Transactional
	public void deleteOverride(String characterId) {
		entityManager.createNativeQuery("delete from public.typing_character_frame_overrides where character_id = :characterId")
			.setParameter("characterId", characterId)
			.executeUpdate();
	}

	private OverrideRow toOverrideRow(Object row) {
		Object[] values = (Object[]) row;
		return new OverrideRow((String) values[0], readFrameSlots(values[1]));
	}

	private UserAdminRow toUserAdminRow(Object row) {
		Object[] values = (Object[]) row;
		return new UserAdminRow((String) values[0], (String) values[1]);
	}

	private List<TypingCharacterFrameSlotResponse> readFrameSlots(Object value) {
		try {
			return objectMapper.readValue(value.toString(), FRAME_SLOTS_TYPE);
		} catch (Exception error) {
			throw new IllegalStateException("타자 캐릭터 프레임 슬롯 JSON을 해석하지 못했습니다.", error);
		}
	}

	private String writeJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (Exception error) {
			throw new IllegalStateException("타자 캐릭터 프레임 슬롯 JSON 직렬화에 실패했습니다.", error);
		}
	}
}
