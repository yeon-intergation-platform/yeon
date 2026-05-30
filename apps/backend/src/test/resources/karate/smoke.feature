@smoke @REQ-PLATFORM-HEALTH-001
Feature: Karate 스택 스모크

  Scenario: actuator health 는 인증 없이 200 + UP
    Given url baseUrl
    And path 'actuator', 'health'
    When method get
    Then status 200
    And match response.status == 'UP'
