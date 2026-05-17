# 카드 아이템 저장 Spring 오류 수정 백로그

## 1차

### 작업내용
- 카드 목록에서 카드 수정 저장 시 `Spring backend 요청에 실패했습니다.`가 노출되는 요청 경로를 확인한다.
- Next BFF, Spring client, Spring card-decks controller/service 중 실제 실패 지점을 좁힌다.
- 사용자에게 프레임워크/백엔드 원문이 노출되지 않도록 오류 메시지를 정규화한다.
- 저장 실패 원인을 코드로 수정하고 관련 테스트를 보강한다.
- Spring 인증 이전 후 Kakao env가 backend에 전달되지 않는 배포 구성 누락을 수정한다.
- host-only/domain 중복 `yeon.session` 쿠키가 남아도 리디렉션 루프와 401이 재발하지 않도록 세션 후보 전체를 검증하고 정리한다.

### 논의 필요
- 없음. 사용자가 실제 저장 버그를 지목했다.

### 선택지
- A. 실제 PATCH 저장 경로의 계약/인증/검증 불일치를 수정한다.
- B. 오류 문구만 숨긴다.
- C. 클라이언트에서 임시 재시도만 넣는다.

### 추천
- A를 우선 적용하고, 동시에 사용자 노출 문구도 정규화한다.

### 사용자 방향
- 추천 기준으로 진행한다.

## 2차

### 작업내용
- Spring backend 공개 route 계획이 먼저 확정되면 카드 저장 401/redirect loop 수정으로 돌아온다.
- 후속 구현 후보:
  - backend에 Kakao env 전달 누락 수정
  - host-only/domain 중복 `yeon.session` 쿠키 정리
  - stale session이 남아도 `/` ↔ cleanup 리디렉션 루프가 생기지 않도록 세션 후보 전체 검증
  - 카드 PATCH 401 시 내부 구현명 없는 사용자 메시지와 auth state 전이

### 논의 필요
- Spring 공개 route 도메인(`api.yeon.world` 또는 `backend.yeon.world`) 확정.

### 선택지
- A. Spring 공개 route 확정 후 인증 안정화 구현을 이어간다.
- B. 공개 route 없이 기존 Next BFF 경계 안에서만 수정한다.

### 추천
- A. 사용자가 Cloudflare Tunnel route를 먼저 계획하자고 지시했으므로 route/보안 경계 확인 뒤 진행한다.

### 사용자 방향
- Spring backend public route 계획을 먼저 세우고, 그 다음 기존 인증/카드 저장 수정으로 돌아간다.
