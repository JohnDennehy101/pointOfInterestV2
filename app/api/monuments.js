'use strict';

const Monument = require('../models/monuments');
const Image = require('../models/image');
const ImageFunctionality = require('../utils/imageFunctionality');
const CategoryFunctionality = require('../utils/categoryFunctionality');
const Boom = require("@hapi/boom");


const Monuments = {
  find: {
    auth: false,
    handler: async function (request, h) {
      const monuments = await Monument.find();
      return monuments;
    },
  },
  findOne: {
    auth: false,
    handler: async function (request, h) {
      try {
        const monument = await Monument.findOne({ _id: request.params.id });
        if (!monument) {
          return Boom.notFound("No monument with this id");
        }
        return monument;
      } catch (err) {
        return Boom.notFound("No monument with this id");
      }
    },
  },
  findMonumentImages: {
   auth: false,
   handler: async function (request, h) {
     try {
       const monument = await Monument.findOne({_id: request.params.id});

       if (!monument) {
         return Boom.notFound("No monument with this id");
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
       return Boom.notFound("No monument with this id")
     }
   }
  },

  create: {
    auth: false,
    payload: {
      output: "stream",
      parse: true,
      allow: "multipart/form-data",
      maxBytes: 2 * 40000 * 40000,
      multipart: true,
    },
    handler: async function (request, h) {
      //image variable contains value from image input field
      const data = await request.payload;
      const image = await request.payload.imageUpload;
      console.log(data);
      //Wrangle request payload to create cloudinary images, add image documents in mongodb and return image document ids and titles
      let imageResult = await ImageFunctionality.addMonumentImages(image, data);
      const newMonument = new Monument({
        title: request.payload.title,
        description: request.payload.description,
        //user: user._id,
        categories: [],
        images: imageResult.imageIds,
        province: request.payload.province,
        county: request.payload.county,
        coordinates: { latitude: request.payload.latitude, longitude: request.payload.longitude },
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
        request.payload.province,
        newMonument
      );

      //Adding province category document id to new monument categories array (which was empty on creation)
      newMonument.categories.push(provinceCategoryId);

      let monumentId = newMonument._id;
      const monument = await newMonument.save();
      //Set monument field on each image document associated with newly created monument.
      await ImageFunctionality.addMonumentIdToImageRecords(imageResult.imageTitles, monumentId);
      if (monument) {
        return h.response(monument).code(201);
      }
      return Boom.badImplementation("error creating monument");
    },
  },
  edit: {
    auth: false,
    handler: async function (request, h) {
      try {
        const updatedMonument = await Monument.updateOne({ _id: request.params.id }, request.payload);
        if (!updatedMonument) {
          return Boom.notFound("No monument with this id");
        }

        return updatedMonument;
      } catch (err) {
        return Boom.notFound("No monument with this id");
      }

    }
  },
  partiallyEdit: {
    auth: false,
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
    auth: false,
    handler: async function (request, h) {
      await Monument.deleteMany({});
      return { success: true };
    },
  },
  deleteOne: {
    auth: false,
    handler: async function(request, h) {
      const response = await Monument.deleteOne({ _id: request.params.id });
      if (response.deletedCount == 1) {
        return { success: true };
      }
      return Boom.notFound('id not found');
    }
  },
}

module.exports = Monuments;