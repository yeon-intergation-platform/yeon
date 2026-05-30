@starLobby @REQ-STAR-LOBBY-001
Feature: 스타 로비 (관전 룸 / 관리 상태)

  Background:
    * url baseUrl
    * configure headers = internalHeaders

  Scenario: 관전 가능한 룸 목록을 조회한다
    Given path 'api/v1/star-lobby/rooms'
    When method get
    Then status 200
    And match response.rooms == '#array'

  Scenario: Discord 관리 상태를 조회한다
    Given path 'api/v1/star-lobby/admin/discord-status'
    When method get
    Then status 200
    And match response.globalDiscordEnvRequired == '#boolean'
