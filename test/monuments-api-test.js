"use strict";

const assert = require("chai").assert;
const MonumentService = require("./monument-service");
const AccountService = require("./account-service");
const monumentTestData = require("./monuments-test-data.json");
const ImageFunctionality = require('../app/utils/imageFunctionality');
const CategoryFunctionality = require("../app/utils/categoryFunctionality");
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const dotEnvPath = path.resolve('./.env');
const fixtures = require("./accounts-test-data.json");
const utils = require("../app/api/utils.js");
var mocha = require('mocha')
var it = mocha.it
const describe = mocha.describe;


require('dotenv').config({ path: dotEnvPath});

suite("Monument API tests", function () {
  let newUser = fixtures.newUser;

  let monuments = monumentTestData.monuments;
  let newMonument = monumentTestData.newMonument;
  let invalidMonumentCoordinates = monumentTestData.invalidMonumentCoordinates;


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
    const c1 = await monumentService.createMonumentWithoutImages(newMonument);
    const c2 = await monumentService.getMonument(c1._id);
    assert.equal(c1.title, c2.title);
  });

  test("get all non-province categories", async function () {
    this.timeout(35000);
    const c1 = await monumentService.getMonumentCategories();
    assert.isDefined(c1)
    assert.equal(c1.length, 1);
  });

  describe("get image ids associated with a monument", async function () {
    this.timeout(35000);

    it("should wait", async () => {
      const c1 = await monumentService.createMonumentWithoutImages(newMonument);
      assert.isDefined(c1);
      assert.equal(c1.images.length, 1);
    })
  });

  describe("get image url and title for images associated with monument", async function () {
    this.timeout(35000);

    it("should wait", async () => {
      const c1 = await monumentService.createMonumentWithoutImages(newMonument);
      const c2 = await monumentService.getMonumentImages(c1._id)
      assert.isDefined(c2);
      assert.equal(c2.images[0].url, '/src/assets/pointOfInterestDefaultImage.png');
      assert.equal(c2.numberOfResults, 1)
    })
  });


  describe("get weather data for monument coordinates", async function () {
    this.timeout(35000);

    it("should wait", async () => {
      const c1 = await monumentService.createMonumentWithoutImages(newMonument);
      const c2 = await monumentService.getMonumentWeather(c1._id);
      assert.isDefined(c2);
      assert.isDefined(c2.currentWeather);
    })
  });

  describe("no weather data returned for invalid coordinates", async function () {
    this.timeout(35000);

    it("should wait", async () => {
      const c1 = await monumentService.createMonumentWithoutImages(invalidMonumentCoordinates);
      // const afterEditMonument = await monumentService.fullyEditMonument(c1._id, c1);
      // console.log(afterEditMonument);
      const c2 = await monumentService.getMonumentWeather(c1._id);
      assert.equal(c2.weatherAvailable, false);
    })
  });

  test("get weather data for monument coordinates", async function () {
    this.timeout(35000);

    const c1 = await monumentService.createMonumentWithoutImages(newMonument);
    const c2 = await monumentService.getMonumentWeather(c1._id);
    assert.isDefined(c2);
    assert.isDefined(c2.currentWeather);
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

  test("Add image functionality", async function() {
    this.timeout(35000);
    const image = fs.readFileSync(path.join(__dirname, './testImages/castle.jpg'));
    const imageObject = {
      _data: image,
      hapi: {
        filename: "testImage1.jpg",
      },
      length: 1,
    }

    const dummyPayload = {
      _data: image,
      imageUpload: {
        hapi: {
          filename: "testImage1.jpg"
        }
      }
    }
    const cloudinaryConfig = {
      cloud_name: "monuments",
      api_key: process.env.cloudinary_api_key,
      api_secret: process.env.cloudinary_api_secret,
    }
    let imageResult = await ImageFunctionality.addMonumentImages(imageObject, dummyPayload, cloudinaryConfig);

    assert.isDefined(imageResult);
    assert.equal(1, imageResult.imageIds.length);
    assert.equal(1, imageResult.imageTitles.length);
    assert.equal('testImage1.jpg', imageResult.imageTitles[0]);
  })


  describe("fully edit a monument", async function () {
    this.timeout(35000);

    it("should wait", async () => {
      const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);

      returnedMonument['title'] = 'New Title';
      returnedMonument['description'] = 'new description';
      returnedMonument['county'] = 'Antrim';
      returnedMonument['province'] = 'Ulster';
      returnedMonument['latitude'] = 2.5;
      returnedMonument['longitude'] = 4.5;
      returnedMonument['imageUpload'] = '';

      const afterEditMonument = await monumentService.fullyEditMonument(returnedMonument._id, returnedMonument);

      assert.isDefined(afterEditMonument);
      assert.equal('New Title', afterEditMonument.title);
      assert.equal('new description', afterEditMonument.description);
      assert.equal('Antrim', afterEditMonument.county);
      assert.equal('Ulster', afterEditMonument.province);
      assert.equal(-6.543, afterEditMonument.coordinates.latitude);
      assert.equal(2.653, afterEditMonument.coordinates.longitude);
      assert.equal(1, afterEditMonument.images.length);


    })
  });

  test("Invalid monument id does not edit record", async () => {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);

    returnedMonument['title'] = 'New Title';
    returnedMonument['description'] = 'new description';
    returnedMonument['county'] = 'Antrim';
    returnedMonument['province'] = 'Ulster';
    returnedMonument['latitude'] = 2.5;
    returnedMonument['longitude'] = 4.5;
    returnedMonument['imageUpload'] = '';

    const afterEditMonument = await monumentService.fullyEditMonument(1234455565, returnedMonument);
    assert.equal(afterEditMonument, null);
  })

  test("create new monument category", async () => {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    let category = await CategoryFunctionality.addMonumentAdditionalCategories(returnedMonument.categories, returnedMonument._id);
    assert.isDefined(category);
    assert.equal(category.length, 1);
  })

  test("create new monument categories", async () => {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    returnedMonument.categories.push("Test");
    let categories = await CategoryFunctionality.editMonumentAdditionalCategories(returnedMonument.categories, returnedMonument._id);
    assert.isDefined(categories);
    assert.equal(categories.length, 2);
  })

  test("delete a monument", async function () {
    let c = await monumentService.createMonumentWithoutImages(newMonument);
    assert(c._id != null);
    await monumentService.deleteOneMonument(c._id);
    c = await monumentService.getMonument(c._id);
    assert(c == null);
  });

});