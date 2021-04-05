"use strict";

const env = require("dotenv");
env.config();

const Mongoose = require("mongoose");
const Monument = require("./monuments");

Mongoose.set("useNewUrlParser", true);
Mongoose.set("useUnifiedTopology", true);
Mongoose.set("useFindAndModify", false);

Mongoose.connect(process.env.db);

const db = Mongoose.connection;

async function seed() {
  var seeder = require('mais-mongoose-seeder')(Mongoose);
  const data = require('./seed-data.json');
  const User = require('./user');
  const Monument = require('./monuments');
  const Image = require('./image');
  const Category = require('./categories');
  const dbData = await seeder.seed(data, { dropDatabase: false, dropCollections: true });
  //console.log(dbData);
  return dbData;

}

async function updateSeededData(data) {
  let monuments = await data.monuments;
  let categories = await data.categories;
  let images = data.images;

  for (let index in monuments) {
    for (let imageIndex in images) {
      if (monuments[index]._id == images[imageIndex].monument) {
        monuments[index].images.push(images[imageIndex]._id)

      }
    }


    for (let individualCategory in categories) {
      if (categories[individualCategory].monuments.includes(monuments[index]._id) && categories[individualCategory].monuments.length > 0) {
        monuments[index].categories.push(categories[individualCategory]._id)
      }
    }


    await Monument.updateOne({_id: monuments[index]._id}, {images: monuments[index].images, categories: monuments[index].categories})


  }



}

db.on("error", function (err) {
  console.log(`database connection error: ${err}`);
});

db.on("disconnected", function () {
  console.log("database disconnected");
});

db.once("open", async function () {
  console.log(`database connected to ${this.name} on ${this.host}`);
  let seededData = await seed();
  await updateSeededData(seededData);
});
