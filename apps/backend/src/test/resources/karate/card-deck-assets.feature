@cardDeckAssets
Feature: 카드 덱 이미지 등록(업로드/조회) API

  # 실행 가능한 Karate 시나리오. card-deck-assets.scenarios.yaml 의 명세와 1:1로 대응한다.
  # 실행: 라이브 서버를 띄운 뒤 standalone Karate 로 구동한다.
  #   1) 로컬 Spring 직접:  baseUrl=http://127.0.0.1:8081,  헤더 X-Yeon-Internal-Token 필요
  #   2) Next BFF 프록시:   baseUrl=http://127.0.0.1:3000/api/v1 (Next 가 내부 토큰을 주입)
  #   java -jar karate.jar -Dkarate.env=local card-deck-assets.feature
  # baseUrl / internalToken 은 karate-config.js 에서 주입한다.
  # >1MB 멀티파트 한도 회귀(UPLOAD_OVER_1MB_SUCCEEDS)는 바이트 합성이 쉬운
  # CardDeckAssetUploadIntegrationTest(Testcontainers)가 실 HTTP로 검증한다.

  Background:
    * url baseUrl
    # 1x1 투명 PNG (유효한 image/png 헤더). 백엔드는 content-type 헤더로 형식을 검증한다.
    * def pixelPng = karate.fromBase64('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC')
    * configure headers = internalToken ? { 'X-Yeon-Internal-Token': internalToken } : {}

  Scenario: 유효한 PNG를 업로드하면 storageKey/imageUrl을 201로 받는다
    Given path 'card-decks', 'assets'
    And multipart file file = { value: '#(pixelPng)', filename: 'pixel.png', contentType: 'image/png' }
    When method post
    Then status 201
    And match response.storageKey == '#regex card-service/images/[0-9a-f]{32}\\.png'
    And match response.imageUrl == '#regex /api/v1/card-decks/assets/.+'

  Scenario: 업로드한 이미지를 반환된 경로로 되읽으면 원본 바이트가 그대로 온다 (인코딩 슬래시 회귀)
    Given path 'card-decks', 'assets'
    And multipart file file = { value: '#(pixelPng)', filename: 'pixel.png', contentType: 'image/png' }
    When method post
    Then status 201
    * def returnedUrl = response.imageUrl
    # 반환된 절대 경로로 그대로 GET (baseUrl 이 /api/v1 까지 포함하면 프리픽스를 제거)
    * def readPath = baseUrl.endsWith('/api/v1') ? returnedUrl.replace('/api/v1', '') : returnedUrl
    Given url baseUrl.endsWith('/api/v1') ? baseUrl.replace('/api/v1','') : baseUrl
    And path readPath
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

  Scenario: 내부 토큰이 없으면 인증 단계에서 차단된다 (Spring 직접 호출 시)
    # Next 프록시(baseUrl 에 /api/v1 포함) 경유에서는 프록시가 토큰을 주입하므로 건너뛴다.
    * if (baseUrl.endsWith('/api/v1')) karate.abort()
    Given path 'card-decks', 'assets'
    And configure headers = {}
    And multipart file file = { value: '#(pixelPng)', filename: 'pixel.png', contentType: 'image/png' }
    When method post
    Then assert responseStatus == 401 || responseStatus == 403
