# 스프라이트 샘플 public 경로 수정 백로그 (2026-05-15)

## 1차

### 작업내용

- `/sprite-editor/walk-guide-character-sample.png` 404 원인을 수정한다.
- Next.js 앱 정적 파일 위치인 `apps/web/public/sprite-editor/`로 샘플 PNG를 이동한다.

### 논의 필요

- 없음. 실제 브라우저 로그에서 404와 이미지 디코딩 실패가 확인됐다.

### 선택지

- A. 코드 URL을 root public 위치에 맞춘다.
- B. 정적 파일을 Next 앱 public 디렉터리로 이동한다.

### 추천

- B. Next.js 정적 파일 SSOT는 앱의 `public` 디렉터리다.

### 사용자 방향

- `/sprite-editor/walk-guide-character-sample.png 404` 수정.
