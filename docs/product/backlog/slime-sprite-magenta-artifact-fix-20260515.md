# 슬라임 스프라이트 magenta artifact 제거 백로그 (2026-05-15)

## 1차

### 작업내용

- `/sprite-editor`에서 분해된 2~7번 슬라임 프레임 내부에 magenta/밝은 세로선이 보이는 문제를 수정한다.
- 원본 GPT guide sheet의 separator 번짐과 checkerboard 잔여 픽셀을 제거하고, 64x64 8프레임 + 4px gutter 시트를 다시 정규화한다.

### 논의 필요

- 없음. 잘린 프레임 내부에는 guide gutter 선이 보이면 안 된다.

### 선택지

- A. UI slicing 좌표를 조정한다.
- B. public 샘플 에셋 자체에서 separator artifact를 제거한다.

### 추천

- B. 현재 slicing 좌표는 정상이며, 샘플 원본의 separator 번짐이 원인이다.

### 사용자 방향

- "그 자른 이미지에 선이 보이면 안되는거잖아. 2번~7번 이미지를 보면 핑크색 선이 보임 왜지?"
