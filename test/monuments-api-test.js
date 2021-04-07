"use strict";

const assert = require("chai").assert;
const MonumentService = require("./monument-service");
const monumentTestData = require("./monuments-test-data.json");
const _ = require('lodash');

suite("Monument API tests", function () {

  let monuments = monumentTestData.monuments;
  let newMonument = monumentTestData.newMonument;


  const monumentService = new MonumentService("http://localhost:3000");

  setup(async function () {
    await monumentService.deleteAllMonuments();
  });

  teardown(async function () {
    await monumentService.deleteAllMonuments();
  });

  test("get all monuments", async function () {
    for (let c of monuments) {
      await monumentService.createMonument(c);
    }

    const allMonuments = await monumentService.getMonuments();
    assert.equal(allMonuments.length, monuments.length);
  });


  test("get monument", async function () {
    const c1 = await monumentService.createMonument(newMonument);
    const c2 = await monumentService.getMonument(c1._id);
    assert.deepEqual(c1, c2);
  });

  test("get invalid monument", async function () {
    const c1 = await monumentService.getMonument("1234");
    assert.isNull(c1);
    const c2 = await monumentService.getMonument("012345678901234567890123");
    assert.isNull(c2);
  });

  test("get detailed info on monuments", async function () {
    for (let c of monuments) {
      await monumentService.createMonument(c);
    }

    const allMonuments = await monumentService.getMonuments();
    for (var i = 0; i < monuments.length; i++) {
      assert(_.some([allMonuments[i]], monuments[i]), "returnedMonument must be a superset of newMonument");
    }
  });

  test("check that monuments is empty", async function () {
    const allMonuments = await monumentService.getMonuments();
    assert.equal(allMonuments.length, 0);
  });

  test("create a monument", async function () {
    const returnedMonument = await monumentService.createMonument(newMonument);
    assert(_.some([returnedMonument], newMonument), "returnedMonument must be a superset of newMonument");
    assert.isDefined(returnedMonument._id);
  });

  test("edit a monument", async function() {
    const returnedMonument = await monumentService.createMonument(newMonument);
    let editedMonument = returnedMonument;
    editedMonument['title'] = 'Updated Title'
    const afterEditMonument = await monumentService.editMonument(returnedMonument._id, returnedMonument);
    assert.isDefined(afterEditMonument);
    assert.equal(1, afterEditMonument.nModified)
  })

  test("delete a monument", async function () {
    let c = await monumentService.createMonument(newMonument);
    assert(c._id != null);
    await monumentService.deleteOneMonument(c._id);
    c = await monumentService.getMonument(c._id);
    assert(c == null);
  });

});