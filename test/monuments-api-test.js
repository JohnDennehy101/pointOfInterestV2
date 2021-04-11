"use strict";

const assert = require("chai").assert;
const MonumentService = require("./monument-service");
const monumentTestData = require("./monuments-test-data.json");
const ImageFunctionality = require('../app/utils/imageFunctionality');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const dotEnvPath = path.resolve('./.env');


require('dotenv').config({ path: dotEnvPath});

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
    const c2 = await monumentService.getMonument(c1.newMonument._id);
    assert.deepEqual(c1.newMonument, c2);
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
    for (var i = 0; i < monuments.length; i++) {
      assert(_.some([allMonuments[i]], monuments[i]), "returnedMonument must be a superset of newMonument");
    }
  });

  test("get monument images - JSON", async function() {

  })


  test("check that monuments is empty", async function () {
    this.timeout(35000);
    const allMonuments = await monumentService.getMonuments();
    assert.equal(allMonuments.length, 0);
  });

  test("create a monument - without images", async function () {
    this.timeout(35000);
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    assert.equal(returnedMonument.newMonument.title, newMonument.title);
    assert.equal(returnedMonument.newMonument.description, newMonument.description);
    assert.equal(returnedMonument.newMonument.county, newMonument.county);
    assert.equal(returnedMonument.newMonument.province, newMonument.province);
    assert.equal(returnedMonument.newMonument.coordinates.latitude, newMonument.coordinates.latitude);
    assert.equal(returnedMonument.newMonument.coordinates.longitude, newMonument.coordinates.longitude);
    assert.isDefined(returnedMonument.newMonument._id);
  });

  test("create a monument - with 1 image", async function() {
    this.timeout(35000);

    const returnedMonument = await monumentService.createMonumentWithImage(newMonument);

    assert.equal(returnedMonument.newMonument.title, newMonument.title);
    assert.equal(returnedMonument.newMonument.description, newMonument.description);
    assert.equal(returnedMonument.newMonument.county, newMonument.county);
    assert.equal(returnedMonument.newMonument.province, newMonument.province);
    assert.equal(returnedMonument.newMonument.coordinates.latitude, newMonument.coordinates.latitude);
    assert.equal(returnedMonument.newMonument.coordinates.longitude, newMonument.coordinates.longitude);
    assert.isDefined(returnedMonument.newMonument._id);
  })

  test("creation of Cloudinary image with MongoDB instance created", async function() {
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


  test("fully edit a monument", async function() {
    this.timeout(35000);
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    const monumentBeforeEdit = returnedMonument.newMonument;
    let editedMonument = returnedMonument.newMonument;
    editedMonument['title'] = 'New Title';
    editedMonument['description'] = 'new description';
    editedMonument['county'] = 'Antrim';
    editedMonument['province'] = 'Ulster';
    editedMonument['coordinates']['latitude'] = 2.5;
    editedMonument['coordinates']['longitude'] = 4.5;

    const afterEditMonument = await monumentService.fullyEditMonument(editedMonument._id, editedMonument);

    assert.isDefined(afterEditMonument);
    assert.equal('New Title', afterEditMonument.title);
    assert.equal('new description', afterEditMonument.description);
    assert.equal('Antrim', afterEditMonument.county);
    assert.equal('Ulster', afterEditMonument.province);
    assert.equal(2.5, afterEditMonument.coordinates.latitude);
    assert.equal(4.5, afterEditMonument.coordinates.longitude);
    assert.equal(1, afterEditMonument.images.length);
  })

  test("patch - edit monument title", async function() {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    const titleEdit = {title: 'New Title'};

    const afterTitleEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, titleEdit);
    assert.isDefined(afterTitleEdit);
    assert.notEqual(returnedMonument.newMonument.title, afterTitleEdit.title);
  })
  test("patch - edit monument description", async function() {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    const descriptionEdit = {description: 'New Description'};

    const afterDescriptionEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, descriptionEdit);
    assert.isDefined(afterDescriptionEdit);
    assert.notEqual(returnedMonument.newMonument.description, afterDescriptionEdit.description);
  })
  test("patch - edit monument county", async function() {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    const countyEdit = {county: 'Kerry'};

    const afterCountyEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, countyEdit);
    assert.isDefined(afterCountyEdit);
    assert.notEqual(returnedMonument.newMonument.county, afterCountyEdit.county);
  })
  test("patch - edit monument coordinates", async function() {
    const returnedMonument = await monumentService.createMonumentWithoutImages(newMonument);
    const coordinatesEdit = {coordinates: {
      latitude: 10,
        longitude: 34
      }};

    const afterCoordinatesEdit = await monumentService.partiallyEditMonument(returnedMonument.newMonument._id, coordinatesEdit);
    assert.isDefined(afterCoordinatesEdit);
    assert.notEqual(returnedMonument.newMonument.coordinates, afterCoordinatesEdit.coordinates);
  })

  test("delete a monument", async function () {
    let c = await monumentService.createMonumentWithoutImages(newMonument);
    assert(c.newMonument._id != null);
    await monumentService.deleteOneMonument(c.newMonument._id);
    c = await monumentService.getMonument(c.newMonument._id);
    assert(c == null);
  });

});