# 슬라임 스프라이트 샘플 적용 백로그 (2026-05-15)

## 1차

### 작업내용

- GPT image-gen으로 생성한 슬라임 8프레임 시트를 `/sprite-editor`에서 바로 재생 검수할 수 있게 적용한다.
- 생성 이미지의 checkerboard 배경을 제거하고 64x64 8프레임 + 4px magenta gutter guide sheet로 정규화한다.
- 기본 샘플 로딩을 사람형 캐릭터에서 슬라임 8프레임 샘플로 교체한다.

### 논의 필요

- 없음. 사용자가 사람형 대신 슬라임을 메인 캐릭터로 바꾸고 `/sprite-editor`에서 실행되게 하라고 지시했다.

### 선택지

- A. 원본 생성 이미지를 그대로 public에 넣는다.
- B. `/sprite-editor` 절단 규격에 맞춰 64x64 8프레임 guide sheet로 정규화한다.

### 추천

- B. 실제 QA 도구에서 재생/검수하기 좋고 추후 export에도 적합하다.

### 사용자 방향

- "http://localhost:3000/sprite-editor 그 슬라임 이미지 여기서 실행할 수 있게 해봐."
