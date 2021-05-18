"use strict";

const assert = require("chai").assert;
const MonumentService = require("./monument-service");
const AccountService = require("./account-service");
const monumentTestData = require("./monuments-test-data.json");
const ImageFunctionality = require('../app/utils/imageFunctionality');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const dotEnvPath = path.resolve('./.env');
const fixtures = require("./accounts-test-data.json");
const utils = require("../app/api/utils.js");


require('dotenv').config({ path: dotEnvPath});

suite("Monument API tests", function () {
  let newUser = fixtures.newUser;

  let monuments = monumentTestData.monuments;
  let newMonument = monumentTestData.newMonument;


  const accountService = new AccountService("http://JD-2.local:4000");

  const monumentService = new MonumentService("http://JD-2.local:4000");

  setup(async function () {
    const returnedUser = await accountService.createUser(newUser);
    const response = await accountService.authenticate(newUser);
    await monumentService.deleteAllMonuments();

  });

  teardown(async function () {
    await monumentService.deleteAllMonuments();
    await accountService.deleteAllUsers();
    await accountService.clearAuth();
  });

  test("get all monuments", async function () {
    this.timeout(35000);
    for (let c of monuments) {
      await monumentService.createMonumentWithoutImages(c);
    }

    const allMonuments = await monumentService.getMonuments();
    assert.equal(allMonuments.length, monuments.length);
  });


  test("get monument", async function () {
    this.timeout(35000);
    // const c1 = await monumentService.createMonumentWithoutImages(newMonument);
    const c1 = await monumentService.createMonumentWithoutImages(newMonument);
    const c2 = await monumentService.getMonument(c1._id);
    assert.equal(c1.title, c2.title);
  });

  test("get invalid monument", async function () {
    this.timeout(35000);
    const c1 = await monumentService.getMonument("1234");
    assert.isNull(c1);
    const c2 = await monumentService.getMonument("012345678901234567890123");
    assert.isNull(c2);
  });

  test("get detailed info on monuments", async function () {
    this.timeout(35000);
    for (let c of monuments) {
      await monumentService.createMonumentWithoutImages(c);
    }

    const allMonuments = await monumentService.getMonuments();
    let randomCheck = {
      title: allMonuments[2].title,
      province: allMonuments[2].province,
      county: allMonuments[2].county
    }
      assert(_.some([monuments[2]], randomCheck), "returnedMonument must be a superset of newMonument");
  });

  test("get monument images - JSON", async function() {

  })


  test("check that monuments is empty", async function () {
    this.timeout(35000);
    const allMonuments = await monumentService.getMonuments();
    assert.equal(allMonuments.length, 0);
  });

  test("valid monument payload passes schema check", async function () {
    this.timeout(35000);
    const validSchemaCheck = utils.monumentValidation(newMonument);
    assert.equal(validSchemaCheck, true);
  });

  test("invalid monument payload fails schema check", async function () {
    this.timeout(35000);
    const invalidMonument = {
      title: 4949494,
      description: 30303030
    }
    const invalidSchemaCheck = utils.monumentValidation(invalidMonument);
    assert.equal(invalidSchemaCheck, false);
  });

  test("Successful sanitization check for valid monument payload", async function () {
    this.timeout(35000);
    const validSanitizationCheck = utils.monumentInputSanitization(newMonument);
    assert.equal(validSanitizationCheck.title, "Customs House");
  });

  test("Failed sanitization check for payload with script tag", async function () {
    this.timeout(35000);
    const invalidMonument = {
      ...newMonument,
      description: "<script>alert('test')</script>"
    }
    const invalidSanitizationCheck = utils.monumentInputSanitization(invalidMonument);
    assert.equal(invalidSanitizationCheck, false);
  });


  test("create a monument - without images", async function () {
    this.timeout(35000);
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    assert.equal(returnedMonument.title, newMonument.title);
    assert.equal(returnedMonument.description, newMonument.description);
    assert.equal(returnedMonument.county, newMonument.county);
    assert.equal(returnedMonument.province, newMonument.province);
    assert.equal(returnedMonument.coordinates.latitude, newMonument.latitude);
    assert.equal(returnedMonument.coordinates.longitude, newMonument.longitude);
    assert.isDefined(returnedMonument._id);
  });

  test("create a monument - with 1 image", async function() {
    this.timeout(35000);

    const returnedMonument = await monumentService.createMonumentWithImage(newMonument);

    assert.equal(returnedMonument.title, newMonument.title);
    assert.equal(returnedMonument.description, newMonument.description);
    assert.equal(returnedMonument.county, newMonument.county);
    assert.equal(returnedMonument.province, newMonument.province);
    assert.equal(returnedMonument.coordinates.latitude, newMonument.latitude);
    assert.equal(returnedMonument.coordinates.longitude, newMonument.longitude);
    assert.isDefined(returnedMonument._id);
  })

  // test("creation of Cloudinary image with MongoDB instance created", async function() {
  //   this.timeout(35000);
  //   const image = fs.readFileSync(path.join(__dirname, './testImages/castle.jpg'));
  //   const imageObject = {
  //     _data: image,
  //     hapi: {
  //       filename: "testImage1.jpg",
  //     },
  //     length: 1,
  //   }
  //
  //   const dummyPayload = {
  //     _data: image,
  //     imageUpload: {
  //       hapi: {
  //         filename: "testImage1.jpg"
  //       }
  //     }
  //   }
  //   const cloudinaryConfig = {
  //     cloud_name: "monuments",
  //     api_key: process.env.cloudinary_api_key,
  //     api_secret: process.env.cloudinary_api_secret,
  //   }
  //   let imageResult = await ImageFunctionality.addMonumentImages(imageObject, dummyPayload, cloudinaryConfig);
  //
  //   assert.isDefined(imageResult);
  //   assert.equal(1, imageResult.imageIds.length);
  //   assert.equal(1, imageResult.imageTitles.length);
  //   assert.equal('testImage1.jpg', imageResult.imageTitles[0]);
  // })


  test("fully edit a monument", async function() {
    this.timeout(35000);
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    const monumentBeforeEdit = returnedMonument;
    let editedMonument = returnedMonument;
    editedMonument['title'] = 'New Title';
    editedMonument['description'] = 'new description';
    editedMonument['county'] = 'Antrim';
    editedMonument['province'] = 'Ulster';
    editedMonument['latitude'] = 2.5;
    editedMonument['longitude'] = 4.5;

    const afterEditMonument = await monumentService.fullyEditMonument(editedMonument._id, editedMonument);

    assert.isDefined(afterEditMonument);
    assert.equal('New Title', afterEditMonument.title);
    assert.equal('new description', afterEditMonument.description);
    assert.equal('Antrim', afterEditMonument.county);
    assert.equal('Ulster', afterEditMonument.province);
    assert.equal(-6.543, afterEditMonument.coordinates.latitude);
    assert.equal(2.653, afterEditMonument.coordinates.longitude);
    assert.equal(1, afterEditMonument.images.length);
  })

  // test("patch - edit monument title", async function() {
  //   const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
  //   const titleEdit = {title: 'New Title'};
  //
  //   const afterTitleEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, titleEdit);
  //   assert.isDefined(afterTitleEdit);
  //   assert.notEqual(returnedMonument.newMonument.title, afterTitleEdit.title);
  // })
  // test("patch - edit monument description", async function() {
  //   const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
  //   const descriptionEdit = {description: 'New Description'};
  //
  //   const afterDescriptionEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, descriptionEdit);
  //   assert.isDefined(afterDescriptionEdit);
  //   assert.notEqual(returnedMonument.newMonument.description, afterDescriptionEdit.description);
  // })
  // test("patch - edit monument county", async function() {
  //   const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
  //   const countyEdit = {county: 'Kerry'};
  //
  //   const afterCountyEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, countyEdit);
  //   assert.isDefined(afterCountyEdit);
  //   assert.notEqual(returnedMonument.newMonument.county, afterCountyEdit.county);
  // })
  // test("patch - edit monument coordinates", async function() {
  //   const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
  //   const coordinatesEdit = {coordinates: {
  //     latitude: 10,
  //       longitude: 34
  //     }};
  //
  //   const afterCoordinatesEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, coordinatesEdit);
  //   assert.isDefined(afterCoordinatesEdit);
  //   assert.notEqual(returnedMonument.newMonument.coordinates, afterCoordinatesEdit.coordinates);
  // })

  test("delete a monument", async function () {
    let c = await monumentService.createMonumentWithoutImages(newMonument);
    assert(c._id != null);
    await monumentService.deleteOneMonument(c._id);
    c = await monumentService.getMonument(c._id);
    assert(c == null);
  });

});