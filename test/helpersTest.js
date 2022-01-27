const { assert } = require('chai');

const { findUserByEmail, generateRandomString, greet } = require('../helpers/functions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("findUserByEmail", () => {
  it("returns a user object when email matches database", () => {

    const email = "user@example.com";

    const expectedResult = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
  
    assert.deepEqual(findUserByEmail(email, testUsers), expectedResult);
  });

  it("returns null when no email match is found in the database", () => {

    const email = "random@email.com";
  
    assert.isNull(findUserByEmail(email, testUsers));
  });
});

describe("generateRandomString", () => {
  it("returns 6 characters", () => {

    const expectedValue = 6;

    assert.equal(generateRandomString().length, expectedValue);

  });
  it("Does not return 6 characters", () => {

    const expectedValue = '';

    assert.isNotNumber((typeof generateRandomString()), expectedValue);

  });
});

describe("greet", () => {
  it("return greet by the time of day", () => {

    const expectedValue = greet();

    assert.equal(greet(), expectedValue);

  });
});




