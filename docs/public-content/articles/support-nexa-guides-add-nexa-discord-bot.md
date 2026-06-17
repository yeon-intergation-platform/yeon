---
title: "디스코드 서버에 NEXA AI 봇 추가하는 방법"
description: "디스코드 서버 관리자가 NEXA AI 봇을 추가하기 전에 확인할 권한, 설치 페이지, 테스트 순서입니다."
channel: support
service: nexa
category: guides
slug: nexa/guides/add-nexa-discord-bot
status: draft
source_repo: discord-assitant
source_path:
  - /Users/osuma/coding_stuffs/discord-assitant/README.md
  - /Users/osuma/coding_stuffs/discord-assitant/docs/FAQ.md
---

# 디스코드 서버에 NEXA AI 봇 추가하는 방법

NEXA는 디스코드 서버 안에서 AI 응답과 자동화 흐름을 사용할 수 있게 돕는 봇 서비스입니다. 서버에 추가하기 전에는 본인이 서버 관리자이거나 봇 초대 권한을 가진 역할인지 먼저 확인합니다.

## 추가 순서

1. 디스코드에서 봇을 추가할 서버를 열고 본인 역할에 서버 관리 또는 봇 초대 권한이 있는지 확인합니다.
2. NEXA 설치 페이지를 열어 현재 제공되는 설치 안내와 초대 흐름을 확인합니다.
3. 디스코드 권한 승인 화면이 나오면 서버 이름이 맞는지 확인합니다.
4. 요청된 권한이 봇 안내 문서의 권장 권한과 맞는지 확인한 뒤 승인합니다.
5. 서버의 테스트 채널에서 NEXA가 보이는지 확인합니다.
6. 간단한 질문을 보내 응답이 오는지 확인합니다.

## 권한이 부족하면

초대 화면에서 서버가 보이지 않거나 승인할 수 없다면, 디스코드 서버 소유자에게 봇 초대 권한을 요청해야 합니다. 봇이 보이는데도 답하지 않으면 채널별 역할 권한과 Message Content Intent 설정을 함께 확인합니다.

## 추가 후 확인할 것

- 봇이 서버 멤버 목록에 표시됩니다.
- 테스트 채널에서 메시지를 읽고 답변할 수 있습니다.
- 사용할 채널에서 봇 역할이 숨겨져 있지 않습니다.
- 응답이 없다면 권한 문서와 문제 해결 문서를 이어서 확인합니다.
