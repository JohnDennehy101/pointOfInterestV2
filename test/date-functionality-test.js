"use strict";

const assert = require("chai").assert;
const DateFunctionality = require("../app/utils/dateFunctionality");

suite("Date Utility unit tests", function () {
  test("formatDateWithTime function returns a date", () => {
    const date = new Date();
    const dateObject = DateFunctionality.formatDateWithTime(date);
    const dateStringArr = date.toString().split(" ");

  const monthCheck = dateObject.includes(dateStringArr[1]);
  assert.isDefined(dateObject);
  assert.equal(monthCheck, true);

  })

})