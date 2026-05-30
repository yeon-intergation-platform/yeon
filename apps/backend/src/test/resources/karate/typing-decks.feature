@typingDecks @REQ-TYPING-DECK-001
Feature: 타자 덱 라이프사이클 (목록/생성/문장/삭제)

  Background:
    * url baseUrl
    * configure headers = userHeaders

  Scenario: 덱 목록을 조회한다
    Given path 'typing-decks'
    When method get
    Then status 200
    And match response.decks == '#array'

  Scenario: 덱 생성 → 연습 문장 추가 → 상세 → 삭제
    Given path 'typing-decks'
    And request { title: '카라테 타자덱', description: '검증', languageTag: 'ko', visibility: 'private' }
    When method post
    Then status 201
    * def deckId = response.deck.id
    And match deckId == '#regex tdk_.+'

    Given path 'typing-decks', deckId, 'passages'
    And request { title: '문장 1', prompt: '느리더라도 정확하게 친다.', textType: 'short', difficulty: 'easy' }
    When method post
    Then status 201
    And match response.passage.textType == 'short'

    Given path 'typing-decks', deckId
    When method get
    Then status 200
    And match response.deck.id == deckId
    And match response.passages == '#[1]'

    Given path 'typing-decks', deckId
    When method delete
    Then status 204
