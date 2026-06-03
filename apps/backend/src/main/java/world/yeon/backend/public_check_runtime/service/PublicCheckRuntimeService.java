package world.yeon.backend.public_check_runtime.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.public_check_runtime.dto.*;
import world.yeon.backend.public_check_runtime.repository.PublicCheckRuntimeRepository;

@Service
public class PublicCheckRuntimeService {
	private static final int MAX_NAME_LENGTH = 100;
	private static final int MAX_ASSIGNMENT_LINK_LENGTH = 1000;
	private final PublicCheckRuntimeRepository repository;

	public PublicCheckRuntimeService(PublicCheckRuntimeRepository repository) {
		this.repository = repository;
	}

	public GetPublicCheckSessionResponse getSession(String token, String entry, List<String> rememberedEntries) {
		var session = requireActiveSession(token);
		String normalizedEntry = entry == null || entry.isBlank() ? null : entry;
		String rememberedMemberId = rememberedEntries.stream()
			.map(this::parseRememberedEntry)
			.filter(parsed -> parsed != null && session.spacePublicId().equals(parsed.spaceId()))
			.map(RememberedIdentity::memberId)
			.findFirst()
			.orElse(null);
		String rememberedMemberName = null;
		boolean shouldClearRememberedIdentity = false;
		if ("qr".equals(normalizedEntry) && rememberedMemberId != null) {
			var rememberedMember = repository.findMemberByPublicId(session.spaceInternalId(), rememberedMemberId);
			if (rememberedMember == null) {
				shouldClearRememberedIdentity = true;
			} else {
				rememberedMemberName = rememberedMember.name();
			}
		}
		boolean requiresPhoneLast4 = !"qr".equals(normalizedEntry) || rememberedMemberName == null;
		return new GetPublicCheckSessionResponse(
			session.spacePublicId(),
			new PublicCheckSessionPublicResponse(
				session.title(),
				session.checkMode(),
				session.enabledMethods(),
				session.locationLabel(),
				requiresPhoneLast4,
				rememberedMemberName
			),
			shouldClearRememberedIdentity
		);
	}

	public VerifyPublicCheckIdentityResponse verifyIdentity(String token, VerifyPublicCheckIdentityRequest request) {
		var session = requireActiveSession(token);
		if (!session.enabledMethods().contains("qr")) {
			throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "이 세션은 QR 체크인을 지원하지 않습니다.");
		}
		var identity = getSubmittedIdentity(request.name(), request.phoneLast4());
		if (identity == null) {
			throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "이름과 전화번호 뒤 4자리를 입력해 주세요.");
		}
		var memberList = repository.findMembersInSpace(session.spaceInternalId());
		var match = matchMember(memberList, identity.name(), identity.phoneLast4());
		if (match.member() == null) {
			return new VerifyPublicCheckIdentityResponse(
				session.spacePublicId(),
				new VerifyPublicCheckIdentityResultResponse(match.status(), match.message(), null),
				null
			);
		}
		return new VerifyPublicCheckIdentityResponse(
			session.spacePublicId(),
			new VerifyPublicCheckIdentityResultResponse("matched", "본인 확인이 완료되었습니다.", match.member().name()),
			match.member().memberPublicId()
		);
	}

	@Transactional
	public SubmitPublicCheckResponse submit(String token, SubmitPublicCheckRequest request) {
		var session = requireActiveSession(token);
		if (!session.enabledMethods().contains(request.method())) {
			throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "이 체크인 방법은 현재 세션에서 사용할 수 없습니다.");
		}
		validateAssignmentLinkLength(request.assignmentLink());

		String rememberedMemberId = request.remembered() == null ? null : request.remembered().stream()
			.map(this::parseRememberedEntry)
			.filter(parsed -> parsed != null && session.spacePublicId().equals(parsed.spaceId()))
			.map(RememberedIdentity::memberId)
			.findFirst()
			.orElse(null);
		var submittedIdentity = getSubmittedIdentity(request.name(), request.phoneLast4());
		boolean shouldUseRememberedIdentity = "qr".equals(request.method()) && rememberedMemberId != null && submittedIdentity == null;
		boolean shouldClearRememberedIdentity = false;
		PublicCheckRuntimeRepository.MemberRow matched;
		if (shouldUseRememberedIdentity) {
			matched = repository.findMemberByPublicId(session.spaceInternalId(), rememberedMemberId);
			if (matched == null) {
				throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "이 기기의 자동 확인 정보가 만료되어 다시 이름과 전화번호를 입력해 주세요.");
			}
		} else {
			if (submittedIdentity == null) {
				throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "location".equals(request.method()) ? "이름과 전화번호 뒤 4자리를 입력한 뒤 위치 기반체크인을 진행해 주세요." : "QR 체크인은 처음 1회 이름과 전화번호 뒤 4자리 확인이 필요합니다.");
			}
			var memberList = repository.findMembersInSpace(session.spaceInternalId());
			var match = matchMember(memberList, submittedIdentity.name(), submittedIdentity.phoneLast4());
			if (match.member() == null) {
				repository.insertSubmission(
					generatePublicId("pcb"), session.sessionInternalId(), session.spaceInternalId(), null,
					request.method(), match.status(), submittedIdentity.name(), submittedIdentity.phoneLast4(),
					normalizeNullable(request.assignmentStatus()), normalizeNullable(request.assignmentLink()), request.latitude(), request.longitude(), null, null
				);
				return new SubmitPublicCheckResponse(session.spacePublicId(), new SubmitPublicCheckResultResponse(match.status(), match.message(), null), null, shouldClearRememberedIdentity);
			}
			matched = match.member();
		}
		String matchedPhoneLast4 = extractPhoneLast4(matched.phone());
		if (matchedPhoneLast4 == null) {
			throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "전화번호 정보가 부족해 자동 확인을 완료하지 못했습니다. 운영자에게 문의해 주세요.");
		}
		Integer distanceMeters = null;
		boolean shouldMarkAttendance = !"assignment_only".equals(session.checkMode());
		boolean shouldMarkAssignment = !"attendance_only".equals(session.checkMode());
		if ("location".equals(request.method())) {
			if (session.latitude() == null || session.longitude() == null || session.radiusMeters() == null || request.latitude() == null || request.longitude() == null) {
				throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "위치 기반 체크인에 필요한 좌표 정보가 부족합니다.");
			}
			distanceMeters = (int) Math.round(haversineMeters(session.latitude(), session.longitude(), request.latitude(), request.longitude()));
			if (distanceMeters > session.radiusMeters()) {
				repository.insertSubmission(
					generatePublicId("pcb"), session.sessionInternalId(), session.spaceInternalId(), matched.memberInternalId(),
					request.method(), "outside_radius", matched.name(), matchedPhoneLast4,
					normalizeNullable(request.assignmentStatus()), normalizeNullable(request.assignmentLink()), request.latitude(), request.longitude(), distanceMeters,
					"{\"radiusMeters\":" + session.radiusMeters() + "}"
				);
				return new SubmitPublicCheckResponse(
					session.spacePublicId(),
					new SubmitPublicCheckResultResponse("outside_radius", "허용된 위치 반경 밖이라 체크인을 완료하지 못했습니다.", matched.name()),
					null,
					shouldClearRememberedIdentity
				);
			}
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		updateBoardSnapshot(session, matched, request, shouldMarkAttendance, shouldMarkAssignment, now);
		repository.insertSubmission(
			generatePublicId("pcb"), session.sessionInternalId(), session.spaceInternalId(), matched.memberInternalId(),
			request.method(), "matched", matched.name(), matchedPhoneLast4,
			normalizeNullable(request.assignmentStatus()), normalizeNullable(request.assignmentLink()), request.latitude(), request.longitude(), distanceMeters, null
		);
		return new SubmitPublicCheckResponse(
			session.spacePublicId(),
			new SubmitPublicCheckResultResponse("matched", buildSubmissionMessage(session.checkMode()), matched.name()),
			"qr".equals(request.method()) ? matched.memberPublicId() : null,
			shouldClearRememberedIdentity
		);
	}

	private void updateBoardSnapshot(PublicCheckRuntimeRepository.SessionContextRow session, PublicCheckRuntimeRepository.MemberRow matched, SubmitPublicCheckRequest request, boolean shouldMarkAttendance, boolean shouldMarkAssignment, OffsetDateTime now) {
		var existing = repository.findBoardSnapshot(session.spaceInternalId(), matched.memberInternalId());
		String currentAttendance = existing == null || existing.attendanceStatus() == null ? "unknown" : existing.attendanceStatus();
		String currentAssignment = existing == null || existing.assignmentStatus() == null ? "unknown" : existing.assignmentStatus();
		String currentAssignmentLink = existing == null ? null : existing.assignmentLink();
		String nextAttendance = shouldMarkAttendance ? "present" : currentAttendance;
		String nextAssignment = shouldMarkAssignment ? defaultString(request.assignmentStatus(), "unknown") : currentAssignment;
		String nextAssignmentLink = shouldMarkAssignment ? normalizeNullable(request.assignmentLink()) : currentAssignmentLink;
		String source = "location".equals(request.method()) ? "public_location" : "public_qr";
		repository.upsertBoardSnapshot(
			generatePublicId("smb"),
			session.spaceInternalId(),
			matched.memberInternalId(),
			nextAttendance,
			shouldMarkAttendance ? now : existing == null ? null : existing.attendanceMarkedAt(),
			shouldMarkAttendance ? source : existing == null ? null : existing.attendanceMarkedSource(),
			nextAssignment,
			nextAssignmentLink,
			shouldMarkAssignment ? (("unknown".equals(nextAssignment) && nextAssignmentLink == null) ? null : now) : existing == null ? null : existing.assignmentMarkedAt(),
			shouldMarkAssignment ? (("unknown".equals(nextAssignment) && nextAssignmentLink == null) ? null : source) : existing == null ? null : existing.assignmentMarkedSource(),
			now,
			now
		);
		repository.insertBoardHistory(generatePublicId("smbh"), session.spaceInternalId(), matched.memberInternalId(), session.sessionInternalId(), nextAttendance, nextAssignment, nextAssignmentLink, source, now);
	}

	private PublicCheckRuntimeRepository.SessionContextRow requireActiveSession(String token) {
		var session = repository.findSessionByPublicToken(token);
		if (session == null || !"active".equals(session.status())) {
			throw new PublicCheckRuntimeServiceException(404, "SESSION_NOT_FOUND", "유효한 체크인 세션을 찾지 못했습니다.");
		}
		OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
		if (session.opensAt() != null && session.opensAt().isAfter(now)) throw new PublicCheckRuntimeServiceException(403, "SESSION_NOT_OPEN", "아직 열리지 않은 체크인 세션입니다.");
		if (session.closesAt() != null && session.closesAt().isBefore(now)) throw new PublicCheckRuntimeServiceException(403, "SESSION_CLOSED", "이미 종료된 체크인 세션입니다.");
		return session;
	}

	private record SubmittedIdentity(String name, String phoneLast4) {}
	private record MatchResult(PublicCheckRuntimeRepository.MemberRow member, String status, String message) {}
	private record RememberedIdentity(String spaceId, String memberId) {}

	private MatchResult matchMember(List<PublicCheckRuntimeRepository.MemberRow> memberList, String name, String phoneLast4) {
		String normalizedName = normalizeName(name);
		var sameName = memberList.stream().filter(member -> normalizeName(member.name()).equals(normalizedName)).toList();
		var exactMatches = sameName.stream().filter(member -> phoneLast4.equals(extractPhoneLast4(member.phone()))).toList();
		if (exactMatches.size() == 1) return new MatchResult(exactMatches.getFirst(), null, null);
		String verificationStatus = exactMatches.size() > 1 ? "ambiguous" : sameName.stream().anyMatch(member -> extractPhoneLast4(member.phone()) == null) ? "not_ready" : "not_found";
		return new MatchResult(null, verificationStatus, getIdentityFailureMessage(verificationStatus));
	}

	private SubmittedIdentity getSubmittedIdentity(String name, String phoneLast4) {
		String normalizedName = normalizeNullable(name);
		String normalizedPhoneLast4 = normalizeNullable(phoneLast4);
		if (normalizedName == null || normalizedPhoneLast4 == null) return null;
		if (normalizedName.length() > MAX_NAME_LENGTH) {
			throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "이름은 " + MAX_NAME_LENGTH + "자 이하로 입력해 주세요.");
		}
		return new SubmittedIdentity(normalizedName, normalizedPhoneLast4);
	}

	private void validateAssignmentLinkLength(String assignmentLink) {
		String normalized = normalizeNullable(assignmentLink);
		if (normalized != null && normalized.length() > MAX_ASSIGNMENT_LINK_LENGTH) {
			throw new PublicCheckRuntimeServiceException(400, "INVALID_REQUEST", "과제 링크는 " + MAX_ASSIGNMENT_LINK_LENGTH + "자 이하로 입력해 주세요.");
		}
	}

	private String getIdentityFailureMessage(String verificationStatus) {
		return switch (verificationStatus) {
			case "ambiguous" -> "동일한 정보의 수강생이 여러 명이라 운영자 확인이 필요합니다.";
			case "not_ready" -> "전화번호 정보가 부족해 자동 확인을 완료하지 못했습니다. 운영자에게 문의해 주세요.";
			default -> "일치하는 수강생을 찾지 못했습니다.";
		};
	}

	private String buildSubmissionMessage(String checkMode) {
		if ("attendance_only".equals(checkMode)) return "출석 체크가 완료되었습니다.";
		if ("assignment_only".equals(checkMode)) return "과제 체크가 완료되었습니다.";
		return "출석과 과제 체크가 완료되었습니다.";
	}

	private double haversineMeters(double latitudeA, double longitudeA, double latitudeB, double longitudeB) {
		double dLat = Math.toRadians(latitudeB - latitudeA);
		double dLon = Math.toRadians(longitudeB - longitudeA);
		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.toRadians(latitudeA)) * Math.cos(Math.toRadians(latitudeB)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		return 2 * 6371000 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	private String normalizeName(String name) { return name == null ? "" : name.replaceAll("\\s+", "").trim().toLowerCase(); }
	private String extractPhoneLast4(String phone) { String digits = phone == null ? "" : phone.replaceAll("\\D", ""); return digits.length() >= 4 ? digits.substring(digits.length() - 4) : null; }
	private String normalizeNullable(String raw) { if (raw == null) return null; String trimmed = raw.trim(); return trimmed.isBlank() ? null : trimmed; }
	private String defaultString(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
	private String generatePublicId(String prefix) { return prefix + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24); }
	private RememberedIdentity parseRememberedEntry(String raw) {
		if (raw == null) return null;
		String[] parts = raw.split(":", 2);
		if (parts.length != 2) return null;
		String spaceId = normalizeNullable(parts[0]);
		String memberId = normalizeNullable(parts[1]);
		if (spaceId == null || memberId == null) return null;
		return new RememberedIdentity(spaceId, memberId);
	}
}
