@cardDecks @REQ-CARD-DECK-001
Feature: 카드 덱 라이프사이클 (사용자 소유 + 학습설정)

  # userHeaders = 내부토큰 + X-Yeon-User-Id(시드된 테스트 사용자). 하니스가 사용자를 미리 시드한다.

  Background:
    * url baseUrl
    * configure headers = userHeaders

  Scenario: 덱 생성 → 카드 추가(단일/일괄) → 상세 → 수정 → 복습 → 삭제
    # 덱 생성
    Given path 'card-decks'
    And request { title: '카라테 덱', description: '카라테 검증' }
    When method post
    Then status 201
    And match response.deck.title == '카라테 덱'
    * def deckId = response.deck.id
    And match deckId == '#regex dck_.+'

    # 단일 카드 추가
    Given path 'card-decks', deckId, 'items'
    And request { frontText: '질문 1', backText: '답 1' }
    When method post
    Then status 201
    * def itemId = response.item.id

    # 일괄 카드 추가(2개)
    Given path 'card-decks', deckId, 'items', 'bulk'
    And request { items: [ { frontText: 'Q2', backText: 'A2' }, { frontText: 'Q3', backText: 'A3' } ] }
    When method post
    Then status 201
    And match response.items == '#[2]'

    # 상세: 덱 + 카드 3개
    Given path 'card-decks', deckId
    When method get
    Then status 200
    And match response.deck.id == deckId
    And match response.items == '#[3]'

    # 덱 제목 수정
    Given path 'card-decks', deckId
    And request { title: '카라테 덱 수정' }
    When method patch
    Then status 200
    And match response.deck.title == '카라테 덱 수정'

    # 카드 뒷면 수정
    Given path 'card-decks', deckId, 'items', itemId
    And request { backText: '답 1 수정' }
    When method patch
    Then status 200
    And match response.item.backText == '답 1 수정'

    # 복습 기록(good → nextReviewAt 계산)
    Given path 'card-decks', deckId, 'items', itemId, 'review'
    And request { difficulty: 'good' }
    When method post
    Then status 200
    And match response.item.reviewDifficulty == 'good'
    And match response.item.nextReviewAt != null

    # 카드 삭제
    Given path 'card-decks', deckId, 'items', itemId
    When method delete
    Then status 204

    # 덱 삭제
    Given path 'card-decks', deckId
    When method delete
    Then status 204

    # 삭제 확인: 상세 조회 시 더 이상 없음
    Given path 'card-decks', deckId
    When method get
    Then assert responseStatus == 403 || responseStatus == 404

  Scenario: 학습 모드 설정 조회/변경
    Given path 'card-decks', 'study-preference'
    When method get
    Then status 200
    And match response.studyMode == '#regex flashcard|review'

    Given path 'card-decks', 'study-preference'
    And request { studyMode: 'review' }
    When method patch
    Then status 200
    And match response.studyMode == 'review'

  Scenario: 사용자 식별 헤더가 없으면 차단된다
    Given path 'card-decks'
    And configure headers = internalHeaders
    And request { title: '익명 덱' }
    When method post
    # httpBasic 비활성화(전수 감사) 이후 미인증/식별 불가 요청의 차단 응답은
    # 401(basic 챌린지) 대신 403(forbidden)으로도 내려온다. 셋 다 "차단됨"으로 허용.
    Then assert responseStatus == 401 || responseStatus == 400 || responseStatus == 403
