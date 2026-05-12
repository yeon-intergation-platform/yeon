package world.yeon.backend.spaces.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.spaces.dto.CreateSpaceRequest;
import world.yeon.backend.spaces.dto.OkResponse;
import world.yeon.backend.spaces.dto.SpaceListResponse;
import world.yeon.backend.spaces.dto.SpaceMutationResponse;
import world.yeon.backend.spaces.dto.SpaceResponse;
import world.yeon.backend.spaces.dto.UpdateSpaceRequest;
import world.yeon.backend.spaces.repository.SpaceRepository;

@Service
public class SpaceService {
	private final SpaceRepository repository;

	public SpaceService(SpaceRepository repository) {
		this.repository = repository;
	}

	public SpaceListResponse listSpaces(UUID userId) {
		return new SpaceListResponse(repository.listOwnedSpaces(userId).stream().map(this::toResponse).toList());
	}

	public SpaceMutationResponse getSpace(UUID userId, String spaceId) {
		var row = repository.findByPublicId(spaceId);
		if (row == null) {
			throw new SpaceServiceException(404, "SPACE_NOT_FOUND", "스페이스를 찾지 못했습니다.");
		}
		return new SpaceMutationResponse(toResponse(row));
	}

	@Transactional
	public SpaceMutationResponse createSpace(UUID userId, CreateSpaceRequest request) {
		String name = normalizeName(request == null ? null : request.name());
		if (name == null) {
			throw new IllegalArgumentException("스페이스 이름은 필수입니다.");
		}
		String description = trimToNull(request.description(), 1000);
		String startDate = normalizeDate(request.startDate());
		String endDate = normalizeDate(request.endDate());
		String periodError = getSpacePeriodInputError(startDate, endDate);
		if (periodError != null) {
			throw new IllegalArgumentException(periodError);
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		var created = repository.insertSpaceWithDefaults(
			generatePublicId("spc"),
			name,
			description,
			startDate,
			endDate,
			userId,
			now,
			generatePrefixedIds("mtb", 5),
			generatePrefixedIds("mfd", 8)
		);
		return new SpaceMutationResponse(toResponse(created));
	}

	@Transactional
	public SpaceMutationResponse updateSpace(UUID userId, String spaceId, UpdateSpaceRequest request) {
		var existing = repository.findOwnedByPublicId(userId, spaceId);
		if (existing == null) {
			throw new SpaceServiceException(404, "SPACE_NOT_FOUND", "수정할 스페이스를 찾지 못했습니다.");
		}
		String nextName = existing.name();
		if (request != null && request.name() != null) {
			nextName = normalizeName(request.name());
			if (nextName == null) {
				throw new IllegalArgumentException("스페이스 이름은 필수입니다.");
			}
		}

		PeriodPatch patch = resolveUpdateSpacePeriod(existing, request);
		var updated = repository.updateOwnedSpace(
			userId,
			spaceId,
			nextName,
			patch.startDate(),
			patch.endDate(),
			OffsetDateTime.now(ZoneOffset.UTC)
		);
		if (updated == null) {
			throw new SpaceServiceException(404, "SPACE_NOT_FOUND", "수정할 스페이스를 찾지 못했습니다.");
		}
		return new SpaceMutationResponse(toResponse(updated));
	}

	@Transactional
	public OkResponse deleteSpace(UUID userId, String spaceId) {
		if (!repository.deleteOwnedSpace(userId, spaceId)) {
			throw new SpaceServiceException(404, "SPACE_NOT_FOUND", "삭제할 스페이스를 찾지 못했습니다.");
		}
		return OkResponse.success();
	}

	private SpaceResponse toResponse(SpaceRepository.SpaceRow row) {
		return new SpaceResponse(
			row.publicId(),
			row.name(),
			row.description(),
			row.startDate(),
			row.endDate(),
			row.createdByUserId(),
			row.createdAt(),
			row.updatedAt()
		);
	}

	private String normalizeName(String raw) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (trimmed.isBlank()) return null;
		return trimmed.substring(0, Math.min(trimmed.length(), 100));
	}

	private String trimToNull(String raw, int max) {
		if (raw == null) return null;
		String trimmed = raw.trim();
		if (trimmed.isBlank()) return null;
		return trimmed.substring(0, Math.min(trimmed.length(), max));
	}

	private String normalizeDate(String raw) {
		return trimToNull(raw, 10);
	}

	private List<String> generatePrefixedIds(String prefix, int size) {
		return java.util.stream.IntStream.range(0, size).mapToObj(index -> generatePublicId(prefix)).toList();
	}

	protected String generatePublicId(String prefix) {
		return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
	}

	private String getSpacePeriodInputError(String startDate, String endDate) {
		if (startDate == null && endDate == null) {
			return null;
		}
		if (startDate == null || endDate == null) {
			return "진행기간을 입력하려면 시작일과 종료일을 모두 선택해 주세요.";
		}
		if (!isSpaceDateString(startDate) || !isSpaceDateString(endDate)) {
			return "진행기간 날짜 형식이 올바르지 않습니다.";
		}
		if (compareSpaceDateStrings(endDate, startDate) < 0) {
			return "종료일은 시작일보다 빠를 수 없습니다.";
		}
		return null;
	}

	private PeriodPatch resolveUpdateSpacePeriod(SpaceRepository.SpaceRow existingSpace, UpdateSpaceRequest request) {
		if (request == null) {
			return new PeriodPatch(existingSpace.startDate(), existingSpace.endDate());
		}
		boolean hasStartDatePatch = request.startDate() != null;
		boolean hasEndDatePatch = request.endDate() != null;

		if (!hasStartDatePatch && !hasEndDatePatch) {
			return new PeriodPatch(existingSpace.startDate(), existingSpace.endDate());
		}

		String existingStartDate = normalizeDate(existingSpace.startDate());
		String existingEndDate = normalizeDate(existingSpace.endDate());
		String nextStartDate = hasStartDatePatch ? normalizeDate(request.startDate()) : existingStartDate;
		String nextEndDate = hasEndDatePatch ? normalizeDate(request.endDate()) : existingEndDate;

		if (existingStartDate != null) {
			if (hasStartDatePatch && !existingStartDate.equals(nextStartDate)) {
				throw new IllegalArgumentException("진행 시작일은 변경할 수 없습니다.");
			}
			if (hasEndDatePatch && nextEndDate == null) {
				throw new IllegalArgumentException("진행 종료일은 비울 수 없습니다.");
			}
			if (nextEndDate != null && !isSpaceDateString(nextEndDate)) {
				throw new IllegalArgumentException("진행기간 날짜 형식이 올바르지 않습니다.");
			}
			if (existingEndDate != null && nextEndDate != null && compareSpaceDateStrings(nextEndDate, existingEndDate) < 0) {
				throw new IllegalArgumentException("진행 종료일은 앞당길 수 없습니다.");
			}
			if (nextEndDate != null && compareSpaceDateStrings(nextEndDate, existingStartDate) < 0) {
				throw new IllegalArgumentException("종료일은 시작일보다 빠를 수 없습니다.");
			}
			return new PeriodPatch(existingStartDate, nextEndDate);
		}

		String periodError = getSpacePeriodInputError(nextStartDate, nextEndDate);
		if (periodError != null) {
			throw new IllegalArgumentException(periodError);
		}
		return new PeriodPatch(nextStartDate, nextEndDate);
	}

	private boolean isSpaceDateString(String value) {
		if (!value.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
			return false;
		}
		try {
			java.time.LocalDate.parse(value);
			return true;
		} catch (DateTimeParseException error) {
			return false;
		}
	}

	private int compareSpaceDateStrings(String left, String right) {
		return left.compareTo(right);
	}

	private record PeriodPatch(String startDate, String endDate) {}
}
