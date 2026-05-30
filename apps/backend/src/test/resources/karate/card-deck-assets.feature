@cardDeckAssets
Feature: 카드 덱 이미지 등록(업로드/조회) API

  # baseUrl = Spring 직접(예: http://localhost:8081), internalHeaders = karate-config.js 주입.
  # 반환 imageUrl 은 /api/v1/card-decks/assets/... 이므로 Spring 직접 조회 시 /api/v1 만 제거한다.

  Background:
    * url baseUrl
    # 1x1 PNG (유효한 image/png 헤더). 백엔드는 content-type 헤더로 형식을 검증한다.
    * def Base64 = Java.type('java.util.Base64')
    * def pixelPng = Base64.getDecoder().decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC')
    * configure headers = internalHeaders

  Scenario: 유효한 PNG를 업로드하면 storageKey/imageUrl을 201로 받는다
    Given path 'card-decks', 'assets'
    And multipart file file = { value: '#(pixelPng)', filename: 'pixel.png', contentType: 'image/png' }
    When method post
    Then status 201
    And match response.storageKey == '#regex card-service/images/[0-9a-f]{32}\\.png'
    And match response.imageUrl == '#regex /api/v1/card-decks/assets/.+'

  Scenario: 업로드한 이미지를 반환 경로로 되읽으면 200 + 동일 content-type (인코딩 슬래시 회귀)
    Given path 'card-decks', 'assets'
    And multipart file file = { value: '#(pixelPng)', filename: 'pixel.png', contentType: 'image/png' }
    When method post
    Then status 201
    * def springPath = response.imageUrl.replace('/api/v1', '')
    # imageUrl 에 %2F 가 있으면 Spring Security 가 400 차단 → raw 슬래시여야 200
    Given url baseUrl + springPath
    And configure headers = internalHeaders
    When method get
    Then status 200
    And match responseHeaders['content-type'][0] == 'image/png'

  Scenario: 이미지가 아닌 파일은 400으로 거부한다
    Given path 'card-decks', 'assets'
    And multipart file file = { value: 'just text', filename: 'note.txt', contentType: 'text/plain' }
    When method post
    Then status 400
    And match response.message contains 'PNG, JPG, WEBP, GIF'

  Scenario: 빈 파일은 400으로 거부한다
    Given path 'card-decks', 'assets'
    And multipart file file = { value: '', filename: 'empty.png', contentType: 'image/png' }
    When method post
    Then status 400
    And match response.message contains '비어 있는'

  Scenario: 내부 토큰이 없으면 인증 단계에서 차단된다
    Given path 'card-decks', 'assets'
    And configure headers = {}
    And multipart file file = { value: '#(pixelPng)', filename: 'pixel.png', contentType: 'image/png' }
    When method post
    Then assert responseStatus == 401 || responseStatus == 403
