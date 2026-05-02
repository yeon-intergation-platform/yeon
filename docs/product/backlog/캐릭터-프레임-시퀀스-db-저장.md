# 캐릭터 프레임 시퀀스 DB 저장

## 1차: DB 기반 영구 저장 전환

### 작업내용

- DB 테이블 `typing_character_frame_overrides` 추가
- 관리자 API (GET 전체 공개, PUT 관리자 전용)
- 관리자 UI: localStorage → API 전환
- 재생 컴포넌트: DB 오버라이드 반영

### 논의 필요

- 없음 (사용자 방향 확정: DB 저장)

### 선택지

- localStorage 유지: 관리자 브라우저에서만 반영 (기존)
- DB 저장: 모든 유저에게 즉시 반영 (선택)

### 추천

DB 저장

### 사용자 방향

DB 저장으로 전환
