# 백엔드 기능 버그 감사 + 수정

작성일: 2026-06-04

## 배경

유지보수 3종(card/typing/community) 백엔드를 상태 정합성·레이스·검증·IDOR 관점으로 정밀 감사(도메인별 병렬 리뷰 + 직접 재검증). 실제 동작이 깨지는 기능 버그를 찾아 고친다. 동결 counseling/CRM 제외.

## 1차: 확정 critical 3건 + 안전 minor 1건 수정 (전부 직접 재검증)

### 반영(수정 완료)

- **[CRITICAL] 카드방 퇴장 항상 403 → 좀비 방**: `leave` 컨트롤러가 `X-Yeon-Participant-Id`를 서비스로 전달하지 않고 `leaveRoom`이 3-arg 소유권만 호출. race-server는 게스트/유저 식별자 없이 HMAC 검증된 participantId만 보내므로 모든 퇴장이 `PARTICIPANT_NOT_OWNED`(403) → DB/WS 상태 영구 불일치, 방이 목록에 계속 노출. PR #574에서 `updateParticipant`만 고치고 `leaveRoom`은 누락된 회귀. → 컨트롤러+서비스에 callerParticipantId 추가(updateParticipant와 동일 신뢰 경계), race-server 경로 회귀 테스트 추가.
- **[CRITICAL] 타자 race-seed 서명 payload 불일치(탭/CR)**: 백엔드 `jsonString`은 `\\ \" \n` 3종만, race-server는 `JSON.stringify`(탭/CR/제어문자도 이스케이프). 문장에 탭/CRLF가 들어가면 payload가 어긋나 HMAC 불일치 → 사용자가 고른 덱 대신 데모 fallback이 나오는 무음 버그. → 백엔드 이스케이프를 JSON.stringify와 바이트 동일하게(제어문자 0x00~0x1F 포함) 수정.
- **[CRITICAL] OTP verify TOCTOU → 한 OTP로 다중 세션**: `consumeChallenge`가 `and consumed_at is null` 가드 없이 무조건 UPDATE + executeUpdate 결과 미확인 → 동시 verify-otp가 모두 세션 발급. → 원자적 조건부 UPDATE(int 반환) + 서비스가 1일 때만 세션 발급.
- **[MINOR] star-lobby 관측 ingest NPE(500)**: `{"rooms":[null]}` 시 `input` 무가드 역참조로 NPE. → 루프에서 null 원소 skip.

### 보고만(제품 의도 판단 필요 — 별도 차수)

- 친구요청 거절/취소 엔드포인트 부재(set만 있고 decline/unfriend 없음) — 제품 의도 확인 필요.
- ask 투표 집계가 차단 voter를 제외하지 않음(피드 reply count는 제외) — 차단 정책 일관성, 의도 확인 필요.
- star-lobby room_key에 인원수 포함 → 인원 변동 시 같은 방 재알림(Discord 스팸 가능) — dedup 의도와 모순, 확인 필요.
- submitResult HINTED_OK 역할 게이팅 없음(아무 참가자나 제출) — 정책 확인 필요.
- OTP/세션 rate-limit 인메모리(인스턴스 로컬, best-effort), 게스트 키 14hex 절단 충돌 위험 — 운영 전제 확인 필요.

### 검증

- 백엔드 `compileJava compileTestJava test` 전체 BUILD SUCCESSFUL.
- 카드 leave: race-server participantId 경로 회귀 테스트 신규 통과.
