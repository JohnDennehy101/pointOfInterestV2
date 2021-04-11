"use strict";

const axios = require("axios");
let FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const baseUrl = "http://localhost:3000";

class MonumentService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getMonuments() {
    const response = await axios.get(this.baseUrl + "/api/monuments");
    return response.data;
  }

  async getMonument(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/monuments/" + id);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getMonumentImages(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/monuments/" + id + "/images");
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async fullyEditMonument(id, editedMonument) {
    try {
      const response = await axios.put(this.baseUrl + "/api/monuments/" + id, editedMonument);
      return response.data
    } catch (e) {
      return null;
    }
  }

  async editMonumentTitle(id, title) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/monuments/" + id, title);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async editMonumentDescription(id, description) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/monuments/" + id, description);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async editMonumentCounty(id, county) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/monuments/" + id, county);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async editMonumentCoordinates(id, coordinates) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/monuments/" + id, coordinates);
      return response.data;
    } catch (e) {
      return null;
    }
  }


  async deleteAllMonuments() {
    const response = await axios.delete(this.baseUrl + "/api/monuments");
    return response.data;
  }

  async deleteOneMonument(id) {
    const response = await axios.delete(this.baseUrl + "/api/monuments/" + id);
    return response.data;
  }



  async createMonumentWithoutImages(newMonument) {
    let requestFormData = new FormData();
    requestFormData.append('title', String(newMonument.title));
    requestFormData.append('description', String(newMonument.description));
    requestFormData.append('latitude', newMonument.coordinates.latitude);
    requestFormData.append('longitude', newMonument.coordinates.longitude);
    requestFormData.append('county', String(newMonument.county));
    requestFormData.append('province', String(newMonument.province));
    requestFormData.append('test', 'true');
    requestFormData.append('imageUpload',  '');



    //const image = fs.createReadStream(path.join(__dirname, './testImages/castle.jpg'));




    //let image = bufferToStream(buf);
    // image.hapi = {
    //   filename: "testing",
    // }
    //console.log(image);



    // const imageObject = {
    //   _data: image,
    //   hapi: {
    //     filename: "testImage1.jpg",
    //   },
    //   length: 1,
    // }


    // const imageObject = {
    //   _data: buf,
    //   hapi: {
    //     filename: "",
    //   },
    //   length: 1,
    // }






    const response = await axios.post(this.baseUrl + "/api/monuments", requestFormData,  {
      headers: requestFormData.getHeaders()
    });

    return response.data;
  }

  async createMonumentWithImage(newMonument) {
    let requestFormData = new FormData();
    requestFormData.append('title', String(newMonument.title));
    requestFormData.append('description', String(newMonument.description));
    requestFormData.append('latitude', String(newMonument.coordinates.latitude));
    requestFormData.append('longitude', String(newMonument.coordinates.longitude));
    requestFormData.append('county', String(newMonument.county));
    requestFormData.append('province', String(newMonument.province));
    requestFormData.append('test', 'true');
    const image = fs.createReadStream(path.join(__dirname, './testImages/castle.jpg'));
    requestFormData.append('imageUpload',  image);








    //let image = bufferToStream(buf);
    // image.hapi = {
    //   filename: "testing",
    // }
    //console.log(image);



    // const imageObject = {
    //   _data: image,
    //   hapi: {
    //     filename: "testImage1.jpg",
    //   },
    //   length: 1,
    // }


    // const imageObject = {
    //   _data: buf,
    //   hapi: {
    //     filename: "",
    //   },
    //   length: 1,
    // }






    const response = await axios.post(this.baseUrl + "/api/monuments", requestFormData,  {
      headers: requestFormData.getHeaders()
    });

    return response.data;
  }

}

module.exports = MonumentService;