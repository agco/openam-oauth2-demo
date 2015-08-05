Feature: OAuth signin

  Scenario: Hit /auth/callback with invalid code

  Scenario: Use valid credentials
    Given I am an anonymous user
    Given I am anonymous to OpenAM server
    When I browse to the "/"
    And I click oauth signin button
    And I sign into oauth provider with valid credentials
    Then I should see "home.signinSuccess"
    Then I should see "home.logout"
    Then I should see "home.accessToken"

  Scenario: Use invalid credentials
    Given I am an anonymous user
    Given I am anonymous to OpenAM server
    When I browse to the "/"
    And I click oauth signin button
    And I sign into oauth provider with invalid credentials
    Then Browser url should match "http://localhost:9001/api/login"


  Scenario: Fetch resource after successfull signin but token expired
    Given I am an anonymous user
    Given I am anonymous to OpenAM server
    When I browse to the "/"
    And I click oauth signin button
    And I sign into oauth provider with valid credentials
    And Access token expired
    And I click "home.fetchResource"
    Then I should see "There was an error while fetching the resource, logging out..." in "home.resourceError"
    Then I should not see "home.signinSuccess"
    Then I should not see "home.logout"
    Then I should not see "home.accessToken"

  Scenario: Refresh token
    Given I should see "home.refreshToken"
    When I click "home.refreshTokenButton"
    Then I should see "home.logout"
    Then I should see "home.accessToken"

  Scenario: Fetch resource after successfull signin
    Given I am an anonymous user
    Given I am anonymous to OpenAM server
    When I browse to the "/"
    And I click oauth signin button
    And I sign into oauth provider with valid credentials
    And Access token is valid
    And I click "home.fetchResource"
    Then I should not see "home.resourceError"
    Then I should see "home.logout"
    Then I should see "home.accessToken"
    Then I should see "{\n  "name": "box"\n}" in "home.resource"
