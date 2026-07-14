---
title: "Dailyting 영상 로딩에서 mp4 faststart를 선택한 이유"
description: "Dailyting 영상 업로드 뒤 mp4 재생 인덱스를 파일 앞쪽으로 옮긴 이유와, 같은 영상에서 확인한 구조 측정의 범위를 정리합니다."
channel: blog
service: account
category: engineering
slug: engineering/dailyting-video-faststart
status: published
source_repo: backend-engineering-evidence
source_path:
  - /Users/osuma/coding_stuffs/backend-engineering-evidence/case-studies/dailyting-faststart.md
---

# Dailyting 영상 로딩에서 mp4 faststart를 선택한 이유

Dailyting에서 정상적인 영상 URL인데도 재생 시작이 늦어지는 경우를 확인했습니다. 앱 렌더링이나 스토리지 속도로 바로 단정하지 않고, 먼저 mp4 파일의 top-level atom 배치를 확인했습니다.

## 문제를 파일 구조부터 확인한 이유

mp4의 `moov` atom에는 재생 인덱스가 들어 있습니다. 이 atom이 파일 끝에 있으면 progressive 재생기는 인덱스를 읽을 때까지 재생을 시작할 수 없습니다. Dailyting의 원본은 `ftyp → mdat → moov` 순서여서, 재생 시작 전에 파일의 대부분을 먼저 내려받아야 했습니다.

해결은 업로드 확정 단계에서 재인코딩 없이 remux하는 것이었습니다.

```bash
ffmpeg -y -i input.mp4 -c copy -movflags +faststart output.mp4
```

`-c copy`로 코덱을 다시 변환하지 않고, `-movflags +faststart`로 `moov` atom만 파일 앞쪽으로 옮깁니다.

## 같은 영상으로 비교한 구조

1280×720, 10초, 약 829KB의 같은 생성 영상을 비교했습니다. 이 값은 네트워크 속도나 단말 성능이 아니라 재생 인덱스를 읽기 전 필요한 파일 바이트 수입니다.

```text
Before: ftyp → mdat → moov
  moov offset: 824,577
  재생 전 필요한 선행 다운로드: 828,968B (100%)

After:  ftyp → moov → mdat
  moov offset: 32
  재생 전 필요한 선행 다운로드: 4,423B (0.5%)
```

같은 파일 구조에서 재생 인덱스에 도달하기 전 필요한 다운로드가 100%에서 0.5%로 줄었습니다. 즉, 파일 구조상 기다려야 하는 선행 다운로드 조건은 약 99% 감소했습니다.

## 운영 파이프라인에서 지킨 경계

1. 업로드 확정 단계에서 faststart remux를 수행합니다.
2. 실패하면 원본을 확정해 업로드 자체가 막히지 않게 합니다.
3. 상태 전환은 중복 실행되지 않도록 처리합니다.
4. 측정 결과는 파일 구조 근거와 함께 기록하고, 단말 체감 성능 수치로 바꾸어 말하지 않습니다.

## 이 수치가 뜻하지 않는 것

실제 첫 프레임 시간은 네트워크 RTT, 플레이어 버퍼 정책, 단말 성능에 따라 달라집니다. 따라서 이 결과는 “사용자 첫 프레임이 정확히 99% 빨라졌다”가 아니라, “재생기가 인덱스를 얻기 전 기다려야 하는 파일 선행 다운로드 조건이 약 99% 줄었다”는 구조 측정입니다.

## 공개 가능한 근거

- [Dailyting faststart 공개 기술 증빙](https://github.com/Hyeonjun0527/backend-engineering-evidence/blob/main/case-studies/dailyting-faststart.md)
- [Dailyting 서비스](https://dailyting.cloud)

운영 파일, 사용자 데이터, 내부 경로, 배포 구성은 공개하지 않습니다.
