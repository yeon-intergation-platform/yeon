---
title: "디스코드 서버에 NEXA AI 봇 추가하는 방법"
description: "디스코드 서버 관리자가 실제 NEXA 설치 페이지에서 봇을 추가하고, 데스크톱 앱 설치와 구분해 확인하는 순서입니다."
channel: support
service: nexa
category: guides
slug: nexa/guides/add-nexa-discord-bot
status: draft
source_repo: discord-assitant
source_path:
  - /Users/osuma/coding_stuffs/discord-assitant/README.md
  - /Users/osuma/coding_stuffs/discord-assitant/central-server/src/main/resources/static/install.html
  - /Users/osuma/coding_stuffs/discord-assitant/docs/BOT_PERMISSIONS.md
---

# 디스코드 서버에 NEXA AI 봇 추가하는 방법

이 글은 디스코드 서버에 NEXA 봇을 추가하는 절차입니다. NEXA 데스크톱 앱 설치는 내 PC를 로컬 AI Provider로 연결할 때 쓰는 선택 절차이고, 서버에 봇만 추가할 때는 데스크톱 앱을 설치하지 않아도 됩니다.

## 먼저 열 링크

- NEXA 설치 페이지: https://discord-ai.yeon.world/install
- Discord에 NEXA 봇 바로 추가: https://discord.com/oauth2/authorize?client_id=1509346092850876416&permissions=3968122435926081&integration_type=0&scope=applications.commands+bot

## 봇 추가 순서

1. 디스코드에서 봇을 추가할 서버를 정하고, 본인 역할에 서버 관리 또는 봇 초대 권한이 있는지 확인합니다.
2. NEXA 설치 페이지를 열고 “디스코드에 봇 추가”를 누릅니다. 바로 추가하려면 위의 Discord 초대 링크를 열어도 됩니다.
3. Discord 승인 화면에서 서버 이름이 맞는지 확인합니다. 다른 서버가 선택되어 있으면 진행하지 않습니다.
4. 요청 권한을 확인합니다. 권한 설명이 필요하면 NEXA 권한 문서를 먼저 열어 비교합니다.
5. 승인 후 서버 멤버 목록이나 테스트 채널에서 NEXA 봇이 보이는지 확인합니다.
6. 슬래시 명령 목록에 NEXA 명령이 보이면 짧은 테스트 질문을 보내 응답을 확인합니다.

## 데스크톱 앱 설치와 헷갈리지 마세요

설치 페이지에 데스크톱 앱 안내가 함께 보여도, 디스코드 서버에 봇을 추가하는 데스크톱 앱 설치는 필수가 아닙니다. 서버 봇 추가는 Discord 승인 화면에서 끝납니다.

## 추가 후 확인할 것

- 봇이 서버 멤버 목록에 표시됩니다.
- 테스트 채널에서 메시지를 읽고 답변할 수 있습니다.
- 사용할 채널에서 봇 역할이 숨겨져 있지 않습니다.
- 응답이 없다면 권한 문서와 문제 해결 문서를 이어서 확인합니다.
