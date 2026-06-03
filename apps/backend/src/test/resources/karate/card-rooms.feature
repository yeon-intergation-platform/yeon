@cardRooms @REQ-CARD-ROOM-001
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

  Scenario: 전체 라이프사이클(시작→공개→결과→다음→종료)과 상태 모델 가드
    # Wave B status 모델: 방 status는 라이프사이클(waiting/in_progress/finished/closed)만,
    # 현재 카드 진행은 currentCardRevealed 플래그 + card_room_results 결과로 분리된다.

    # 1) 2장 게스트 덱으로 방 생성 → 대기, 방장은 MEMORIZER + 준비완료 + 호스트
    Given path 'api/v1/card-rooms'
    And configure headers = hostHeaders
    And request { title: '라이프사이클 검증', visibility: 'public', guestDeck: { title: '검증덱', items: [ { frontText: 'Q1', backText: 'A1' }, { frontText: 'Q2', backText: 'A2' } ] }, profile: { nickname: '방장', characterId: 'llama' } }
    When method post
    Then status 201
    And match response.room.status == 'waiting'
    And match response.room.currentCardRevealed == false
    And match response.participant.role == 'MEMORIZER'
    And match response.participant.isHost == true
    And match response.participant.isReady == true
    * def roomId = response.room.id
    * def hostPid = response.participant.id
    * def card0 = response.room.cards[0].id
    * def card1 = response.room.cards[1].id

    # 2) 두 번째 게스트가 CHECKER로 입장 → 준비 전(isReady=false)
    Given path 'api/v1/card-rooms', roomId, 'participants'
    And configure headers = guestHeaders
    And request { profile: { nickname: '봐주미', characterId: 'llama' }, role: 'CHECKER' }
    When method post
    Then status 201
    And match response.participant.role == 'CHECKER'
    And match response.participant.isReady == false
    * def checkerPid = response.participant.id

    # 3) 가드: 봐주는 사람 준비 전이면 시작 불가(READY_REQUIRED=409)
    Given path 'api/v1/card-rooms', roomId, 'start'
    And configure headers = hostHeaders
    And header X-Yeon-Participant-Id = hostPid
    When method post
    Then status 409
    And match response.code == 'READY_REQUIRED'

    # 4) 봐주는 사람 준비 완료(PATCH, 본인 소유 검증)
    Given path 'api/v1/card-rooms', roomId, 'participants', checkerPid
    And configure headers = guestHeaders
    And request { isReady: true }
    When method patch
    Then status 200
    And match response.participant.isReady == true

    # 5) 가드: 방장만 시작 가능 — 봐주는 사람이 시작 시도 시 403(HOST_ONLY)
    Given path 'api/v1/card-rooms', roomId, 'start'
    And configure headers = guestHeaders
    And header X-Yeon-Participant-Id = checkerPid
    When method post
    Then status 403
    And match response.code == 'HOST_ONLY'

    # 6) 방장 시작 → 진행 중, 공개 플래그 false, 현재 카드 인덱스 0
    Given path 'api/v1/card-rooms', roomId, 'start'
    And configure headers = hostHeaders
    And header X-Yeon-Participant-Id = hostPid
    When method post
    Then status 200
    And match response.room.status == 'in_progress'
    And match response.room.currentCardRevealed == false
    And match response.room.currentCardIndex == 0

    # 7) 가드(finding 20 회귀방지): 현재 카드 결과 확정 전 next 불가(CARD_NOT_RESOLVED=409)
    Given path 'api/v1/card-rooms', roomId, 'next'
    And header X-Yeon-Participant-Id = hostPid
    When method post
    Then status 409
    And match response.code == 'CARD_NOT_RESOLVED'

    # 8) 봐주는 사람이 정답 공개 → status는 in_progress 유지, 공개 플래그만 true (finding 20 핵심)
    Given path 'api/v1/card-rooms', roomId, 'reveal'
    And configure headers = guestHeaders
    And header X-Yeon-Participant-Id = checkerPid
    When method post
    Then status 200
    And match response.room.status == 'in_progress'
    And match response.room.currentCardRevealed == true

    # 9) 가드: OK 확정은 봐주는 사람만 — 외우는 사람이 시도 시 403(CHECKER_ONLY)
    Given path 'api/v1/card-rooms', roomId, 'results'
    And configure headers = hostHeaders
    And header X-Yeon-Participant-Id = hostPid
    And request { cardId: '#(card0)', result: 'OK' }
    When method post
    Then status 403
    And match response.code == 'CHECKER_ONLY'

    # 10) 봐주는 사람이 card0 OK 확정 → 결과 기록, 방 status는 in_progress 유지, 현재 카드 결과 노출
    Given path 'api/v1/card-rooms', roomId, 'results'
    And configure headers = guestHeaders
    And header X-Yeon-Participant-Id = checkerPid
    And request { cardId: '#(card0)', result: 'OK' }
    When method post
    Then status 200
    And match response.result.result == 'OK'
    And match response.room.status == 'in_progress'
    And match response.room.currentCardResult == 'OK'

    # 11) next → card1로 진행, 공개 플래그 리셋(false), 현재 카드 결과 없음(null)
    Given path 'api/v1/card-rooms', roomId, 'next'
    And configure headers = hostHeaders
    And header X-Yeon-Participant-Id = hostPid
    When method post
    Then status 200
    And match response.room.status == 'in_progress'
    And match response.room.currentCardIndex == 1
    And match response.room.currentCardRevealed == false
    And match response.room.currentCardResult == '#null'

    # 12) 마지막 카드(card1) 결과 확정 — 포기(GIVE_UP)는 외우는 사람만 가능
    Given path 'api/v1/card-rooms', roomId, 'results'
    And configure headers = hostHeaders
    And header X-Yeon-Participant-Id = hostPid
    And request { cardId: '#(card1)', result: 'GIVE_UP' }
    When method post
    Then status 200
    And match response.room.currentCardResult == 'GIVE_UP'

    # 13) next(마지막 카드 resolved) → 종료(finished)
    Given path 'api/v1/card-rooms', roomId, 'next'
    And header X-Yeon-Participant-Id = hostPid
    When method post
    Then status 200
    And match response.room.status == 'finished'
