# Dailyting 영상 로딩 기술 노트 발행

범위: `blog.yeon.world`에 공개 가능한 Dailyting 영상 로딩 개선 사례를 발행하고, 기존 Dailyting 랜딩의 기술 사례 링크를 이 글로 이전할 준비를 한다.

## 1차

### 작업내용

1. `mp4 faststart` 판단, 측정 조건, 해석 한계를 담은 기술 노트를 `blog.yeon.world/engineering/dailyting-video-faststart`에 추가한다.
2. 공개 원고를 `docs/public-content/articles/`에 함께 보관하고 import dry-run으로 frontmatter와 경로를 검증한다.
3. 이미 공개된 기술 증빙 저장소를 글의 근거 링크로 연결한다.
4. sitemap, canonical, RSS에 새 글이 정적 registry에서 자동 파생되는지 확인한다.

### 논의 필요

- 실제 사용자 단말의 첫 프레임 시간을 별도 수집하지 않았으므로, 구조 측정값을 사용자 체감 시간으로 표현할지 여부.

### 선택지

- A. 구조 측정과 한계를 함께 공개한다.
- B. 단말 성능 측정을 추가한 뒤에만 공개한다.
- C. 수치 없이 구현 선택만 공개한다.

### 추천

A를 추천한다. 같은 파일의 atom 배치와 인덱스 도달 전 필요 바이트는 재현 가능한 구조적 근거이며, 실제 첫 프레임 시간과 다르다는 한계를 명확히 쓰면 과장 없이 판단을 설명할 수 있다.

### 사용자 방향

Dailyting 공개 랜딩에는 기술 사례를 두지 않고, 이와 같은 기술 노트는 `blog.yeon.world`에 발행한다.

## 결과

- `https://blog.yeon.world/engineering/dailyting-video-faststart` 공개 경로와 같은 slug의 정적 registry를 추가했다.
- `backend-engineering-evidence`의 공개 사례 문서를 repo 근거로 연결했다.
- 파일 구조 측정과 실제 첫 프레임 시간의 해석 범위를 분리해, 수치 과장을 막았다.
