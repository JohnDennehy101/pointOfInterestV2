"use strict";

const assert = require("chai").assert;
const testMonumentData = require("./monuments-test-data.json");
const ImageFunctionality = require("../app/utils/imageFunctionality");

suite("Image Utility unit tests", function () {
  const newMonument = testMonumentData.newMonument;
  const imageObject = {
        _data: '',
        hapi: {
          filename: "testImage1.jpg",
        },
        length: 1,
      }


  test("Default image used if no image provided to addMonumentImages function", async function () {
    this.timeout(35000);
    const dummyMonumentPayloadNoImage = {
      ...newMonument,
      imageUpload: {
        hapi: {
          filename: ''
        }
      }

    }
    const response = await ImageFunctionality.addMonumentImages(imageObject, dummyMonumentPayloadNoImage, true);
    const titleCheck = response.imageTitles[0].includes("pointOfInterestDefaultImage");
    assert.equal(response.imageIds.length, 1);
    assert.equal(titleCheck, true);
    assert.isDefined(response);
  });


  test("No id or image title returned if no image provided to editMonumentImages function", async function () {
    this.timeout(35000);
    const dummyImageObject = {
      ...imageObject,
      hapi: {
        filename: ''
      }
    }
    const response = await ImageFunctionality.editMonumentImages(dummyImageObject, true, true);
    assert.isDefined(response);
    assert.equal(response.imageIds.length, 0);
    assert.equal(response.imageTitles.length, 0);

  });


})