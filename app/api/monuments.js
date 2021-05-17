'use strict';

const Monument = require('../models/monuments');
const Image = require('../models/image');
const ImageFunctionality = require('../utils/imageFunctionality');
const CategoryFunctionality = require('../utils/categoryFunctionality');
const WeatherFunctionality = require('../utils/weatherFunctionality');
const fs = require("fs");
const Boom = require("@hapi/boom");
const sanitizeHtml = require("sanitize-html");
const Joi = require("@hapi/joi");
const utils = require('./utils.js');


const Monuments = {
  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      const monuments = await Monument.find().populate("user").populate("images").populate("categories").lean();
      return monuments;
    },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      let monument;
      try {
        if (sanitizeHtml(request.params.id)) {
          monument = await Monument.findOne({ _id: sanitizeHtml(request.params.id) }).populate("user").populate("images").populate("categories").lean();
        }

        if (!monument) {
          return h.response().code(404);
        }
        return monument;
      } catch (err) {
        return h.response().code(404);
      }
    },
  },
  findNonProvinceCategories: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const categories = await CategoryFunctionality.findAllOtherCategories();
        if (!categories) {
          return [];
        }
        return categories;
      } catch (err) {
        return Boom.notFound("Error finding categories");
      }
    },
  },
  findMonumentImages: {
    auth: {
      strategy: "jwt",
    },
   handler: async function (request, h) {
      let monument;
     try {
       if (sanitizeHtml(request.params.id)) {
         monument = await Monument.findOne({ _id: sanitizeHtml(request.params.id) });
       }

       if (!monument) {
         return h.response().code(404);
       }

       const monumentImageObjectIds = monument.images;

       let imageJsonResponse = {
         "numberOfResults": monumentImageObjectIds.length,
         "images": []
       };

       if (monumentImageObjectIds.length > 0) {
           const images = await Image.find({_id: {$in: monumentImageObjectIds}});
           for (let individualImage in images) {
              imageJsonResponse["images"].push({
                "title": images[individualImage].title,
                "url": images[individualImage].imageUrl
              })
           }

           return imageJsonResponse;
       }
     } catch (err) {
       return h.response().code(404);
     }
   }
  },

  getMonumentWeather: {
    auth: {
      strategy: 'jwt',
    },
    handler: async function (request, h) {
      let monument;
      if (sanitizeHtml(request.params.id)) {
        monument = await Monument.findOne({ _id: sanitizeHtml(request.params.id) });
      }
      else {
        return h.response().code(404);
      }

      let weatherApiResponse = await WeatherFunctionality.getWeatherDetails(monument);

      //Wrangle api response to return values in format that will be consumed by view monument view
      //If no response from api, everything set to undefined (to indicate that noWeatherDataComponent should be displayed)
      let weatherDataObject = await WeatherFunctionality.manipulateApiResponse(weatherApiResponse);

      return {
        currentWeather: weatherDataObject.currentWeather,
        currentWeatherFormattedObject: weatherDataObject.currentWeatherFormattedObject,
        currentWeatherDescription: weatherDataObject.currentWeatherDescription,
        weatherForecastNextWeek: weatherDataObject.weatherForecastNextWeek,
        sunset: weatherDataObject.formattedSunsetTime,
        weatherAvailable: weatherDataObject.weatherAvailable,
      }

    }

  },

  create: {
    auth: {
      strategy: "jwt",
    },
    payload: {
      output: "stream",
      parse: true,
      allow: "multipart/form-data",
      maxBytes: 2 * 40000 * 40000,
      multipart: true,
    },
    handler: async function (request, h) {
      console.log(request.payload);
      console.log("HTTT")
      const validationCheck = utils.monumentValidation(request.payload);

      console.log(validationCheck);

      if (!validationCheck.error) {

        console.log("Getting past validation");

        const successSanitisationCheck = utils.monumentInputSanitization(request.payload);

        if (successSanitisationCheck) {

          console.log("Getting past sanitisation");

          //image variable contains value from image input field
          const data = await successSanitisationCheck;
          const image = request.payload.imageUpload;
          //categories variable contains value from request.payload.category
          let categories = successSanitisationCheck.category;

          //Wrangle request payload to create cloudinary images, add image documents in mongodb and return image document ids and titles
          let imageResult = await ImageFunctionality.addMonumentImages(image, request.payload);
          const newMonument = new Monument({
            title: successSanitisationCheck.title,
            description: successSanitisationCheck.description,
            //user: user._id,
            categories: [],
            images: imageResult.imageIds,
            province: successSanitisationCheck.province,
            county: successSanitisationCheck.county,
            coordinates: { latitude: successSanitisationCheck.latitude, longitude: successSanitisationCheck.longitude},
          });

          await newMonument.save();

          if (request.payload.test) {
            return {
              newMonument: newMonument,
              imageResult: imageResult
            }
          }


          //Adding province category (if province category does not exist, new one created and monument Id added).
          //If province category already exists, monument id is appended to existing province category
          let provinceCategoryId = await CategoryFunctionality.addMonumentProvinceCategory(
            successSanitisationCheck.province,
            newMonument
          );

          //Adding province category document id to new monument categories array (which was empty on creation)
          newMonument.categories.push(provinceCategoryId);


          let monumentId = newMonument._id;
          await newMonument.save();

          //Additional categories check (if user has checked a category on monument creation or added a new category and checked it).
          //Adding other categories (if relevant other category does not exist, new one created and monument Id added).
          //If other category already exists, monument id is appended to existing category
          let otherCategoryIds = await CategoryFunctionality.addMonumentAdditionalCategories(categories, monumentId);

          //If the length of otherCategoryIds is greater than 0, user did select other categories for monument.
          //Programme loops through each, appending each category document id to the monument categories array (adding to the province category id that was already added above)
          if (otherCategoryIds.length > 0) {
            for (let id in otherCategoryIds) {
              newMonument.categories.push(otherCategoryIds[id]);
            }

            await newMonument.save();
          }


          const monument = await newMonument.save();
          //Set monument field on each image document associated with newly created monument.
          await ImageFunctionality.addMonumentIdToImageRecords(imageResult.imageTitles, monumentId);
          if (monument) {
            return h.response(monument).code(201);
          }
        }

        else {
          return h.response().code(400);
        }

      }



      return h.response().code(400);
    },
  },
  edit: {
    auth: {
      strategy: "jwt",
    },
    payload: {
      output: "stream",
      parse: true,
      allow: "multipart/form-data",
      maxBytes: 2 * 40000 * 40000,
      multipart: true,
    },
    handler: async function (request, h) {
      let monument, updatedMonument;
      try {

        const validationCheck = utils.monumentValidation(request.payload);

        if (!validationCheck.error) {

          const successSanitisationCheck = utils.monumentInputSanitization(request.payload);

          if (successSanitisationCheck) {

            const monumentEdit = request.payload;

            if (sanitizeHtml(request.params.id)) {
              monument = await Monument.findById(sanitizeHtml(request.params.id));
            }

            let monumentId = monument._id;

            let categories = successSanitisationCheck.category;

            const image = await request.payload.imageUpload;

            let allPriorImagesRemoved = undefined;
            if (monument.images.length > 0 && image.length === undefined) {
              allPriorImagesRemoved = true;
            }
            let imageResult = undefined;

            if (image !== "") {

              //If user has provided new input in images file, new image documents are created
              imageResult = await ImageFunctionality.editMonumentImages(image, allPriorImagesRemoved);


            }


            //Removing existing categories (to ensure any previous categories that are no longer checked are up to date)
            await CategoryFunctionality.pullPriorMonumentIds(monumentId);

            //Pushing monument id to province category (as user may have changed the province on the form)
            await CategoryFunctionality.editMonumentProvince(successSanitisationCheck.province, monumentId);

            //Obtaining other category mongodb document ids (if user has selected additional categorisation to province)
            let newOtherCategoryIds = await CategoryFunctionality.editMonumentAdditionalCategories(categories, monument._id);




            monument.title = monumentEdit.title;
            monument.description = monumentEdit.description;
            //NEED TO UPDATE CATEGORY PROVINCE HERE
            monument.province = monumentEdit.province;
            monument.county = monumentEdit.county;
            //monument.user = monumentEdit._id;

            //If imageResult.imageIds array length is greater than 0, set monument images field to newly created image ids
            if (imageResult) {
              if (imageResult.imageIds.length > 0) {
                monument.images = imageResult.imageIds;
              }
            }


            //Appending record province category id to monument categories array
            monument.categories = [monument.categories[0]];
            monument.coordinates.latitude = monumentEdit.latitude;
            monument.coordinates.longitude = monumentEdit.longitude;

            //If user has selected other categories for monument, these are appended to the monument categories array
            if (newOtherCategoryIds.length > 0) {
              for (let id in newOtherCategoryIds) {
                if (!monument.categories.includes(newOtherCategoryIds[id])) {
                  monument.categories.push(newOtherCategoryIds[id]);
                }
              }
            }

            await monument.save();

            //Ensuring that each image document associated with this monument has monument field set to correct monument document id
            if (imageResult) {
              await ImageFunctionality.addMonumentIdToImageRecords(imageResult.imageTitles, monument._id);
            }

            if (monument) {

              return h.response(monument).code(201);
            }
            return h.response().code(400);


            if (sanitizeHtml(request.params.id)) {
              updatedMonument = await Monument.updateOne({ _id: sanitizeHtml(request.params.id) }, request.payload);
            }

            if (!updatedMonument) {
              return h.response().code(404);
            }

            return updatedMonument;


          }

        }


      } catch (err) {
        return h.response().code(404);
      }

    }
  },
  partiallyEdit: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const allCounties = [ 'antrim',
          'armagh',
          'carlow',
          'cavan',
          'clare',
          'cork',
          'derry',
          'donegal',
          'down',
          'dublin',
          'fermanagh',
          'galway',
          'kerry',
          'kildare',
          'kilkenny',
          'laois',
          'leitrim',
          'limerick',
          'longford',
          'louth',
          'mayo',
          'meath',
          'monaghan',
          'offaly',
          'roscommon',
          'sligo',
          'tipperary',
          'tyrone',
          'waterford',
          'westmeath',
          'wexford',
          'wicklow'];
        const monument = await Monument.findOne({ _id: request.params.id });
        if (!monument) {
          return Boom.notFound("No monument with this id");
        }
        if (request.payload.title) {
          monument.title = request.payload.title;
        }
        if (request.payload.description) {
          monument.description = request.payload.description;
        }
        if (request.payload.county) {
          if (allCounties.includes(request.payload.county.toLowerCase())) {
            monument.county = request.payload.county;
          }

        }
        if (request.payload.coordinates) {
          if (Number(request.payload.coordinates.latitude)) {
            monument.coordinates.latitude = request.payload.coordinates.latitude;
          }
          if (Number(request.payload.coordinates.longitude)) {
            monument.coordinates.longitude = request.payload.coordinates.longitude;
          }

        }
        await monument.save();
        return monument;
      } catch (err) {
        return Boom.notFound("No Monument with this id");
      }
    }
  },
  deleteAll: {
    // auth: {
    //   strategy: "jwt",
    // },
    auth: false,
    handler: async function (request, h) {
      await Monument.deleteMany({});
      return { success: true };
    },
  },
  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function(request, h) {
      let response;
      if (sanitizeHtml(request.params.id)) {
        response = await Monument.deleteOne({ _id: sanitizeHtml(request.params.id) });
      }

      if (response.deletedCount == 1) {
        return { success: true };
      }
      return h.request().code(404);
    }
  },
  // addMonumentImages: {
  //   auth: false,
  //   payload: {
  //     output: "stream",
  //     parse: true,
  //     allow: "multipart/form-data",
  //     maxBytes: 2 * 40000 * 40000,
  //     multipart: true,
  //   },
  //   handler: async function(request,h) {
  //     try {
  //       const monument = await Monument.findOne({_id: request.params.id});
  //
  //
  //
  //       if (!monument) {
  //         return Boom.notFound("No monument with this id");
  //       }
  //
  //       const monumentImageObjectIds = monument.images;
  //
  //       const image = await request.payload.imageUpload;
  //       //Wrangle request payload to create cloudinary images, add image documents in mongodb and return image document ids and titles
  //       //Need data in format
  //       //let imageResult = await ImageFunctionality.addMonumentImages(image, monum);
  //
  //       let imageJsonResponse = {
  //         "numberOfResults": monumentImageObjectIds.length,
  //         "images": []
  //       };
  //
  //       if (monumentImageObjectIds.length > 0) {
  //         const images = await Image.find({_id: {$in: monumentImageObjectIds}});
  //         for (let individualImage in images) {
  //           imageJsonResponse["images"].push({
  //             "title": images[individualImage].title,
  //             "url": images[individualImage].imageUrl
  //           })
  //         }
  //
  //         return imageJsonResponse;
  //       }
  //     } catch (err) {
  //       return Boom.notFound("No monument with this id")
  //     }
  //   }
  // }
}

module.exports = Monuments;