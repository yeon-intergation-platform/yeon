@communityChat @REQ-COMMUNITY-CHAT-001
Feature: 커뮤니티 실시간 채팅 (게스트, permitAll)

  Background:
    * url baseUrl

  Scenario: 게스트 메시지를 전송하고 목록에서 다시 확인한다
    Given path 'api/v1/community-chat/messages'
    And request { body: '카라테 검증 메시지', guestSessionId: 'karate-guest-001', guestNickname: '카라테' }
    When method post
    Then status 201
    And match response.message.body == '카라테 검증 메시지'
    And match response.message.senderNickname == '카라테'
    * def newId = response.message.id

    Given path 'api/v1/community-chat/messages'
    When method get
    Then status 200
    And match response.messages == '#[_ > 0]'
    And match response.messages[*].id contains newId

  Scenario: 빈 본문 메시지는 400으로 거부한다
    Given path 'api/v1/community-chat/messages'
    And request { body: '', guestSessionId: 'karate-guest-001', guestNickname: '카라테' }
    When method post
    Then status 400
    And match response.code == 'COMMUNITY_CHAT_INVALID'
