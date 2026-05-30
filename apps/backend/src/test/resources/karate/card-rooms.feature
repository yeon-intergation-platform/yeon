@cardRooms
Feature: 카드방 라이프사이클 (게스트 인라인 덱)

  # deckId(소유 덱) 대신 guestDeck(인라인 스냅샷)으로 사용자/덱 의존 없이 방 흐름을 검증한다.

  Background:
    * url baseUrl
    * def hostHeaders = ({ 'X-Yeon-Internal-Token': internalToken, 'X-Yeon-Guest-Id': 'karate-room-host' })
    * def guestHeaders = ({ 'X-Yeon-Internal-Token': internalToken, 'X-Yeon-Guest-Id': 'karate-room-guest' })
    * configure headers = hostHeaders

  Scenario: 방 생성 → 상세 → 목록 → 참가자 입장
    Given path 'api/v1/card-rooms'
    And request { title: '카라테 카드방', visibility: 'public', guestDeck: { title: '검증덱', items: [ { frontText: 'Q1', backText: 'A1' }, { frontText: 'Q2', backText: 'A2' } ] }, profile: { nickname: '방장', characterId: 'llama' } }
    When method post
    Then status 201
    And match response.room.cards == '#[2]'
    And match response.room.status == 'waiting'
    And match response.room.participants[0].isHost == true
    * def roomId = response.room.id
    And match roomId == '#regex crm_.+'

    # 상세 조회
    Given path 'api/v1/card-rooms', roomId
    When method get
    Then status 200
    And match response.room.id == roomId

    # 목록에 생성한 방이 포함
    Given path 'api/v1/card-rooms'
    When method get
    Then status 200
    And match response.rooms[*].id contains roomId

    # 두 번째 참가자(CHECKER) 입장
    Given path 'api/v1/card-rooms', roomId, 'participants'
    And configure headers = guestHeaders
    And request { profile: { nickname: '참가자', characterId: 'llama' }, role: 'CHECKER' }
    When method post
    Then status 201
    And match response.participant.role == 'CHECKER'
