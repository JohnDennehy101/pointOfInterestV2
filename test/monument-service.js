"use strict";

const axios = require("axios");
let FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const baseUrl = "http://localhost:4000";

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

  async getMonumentCategories() {
    try {
      const response = await axios.get(this.baseUrl + "/api/monuments/categories");
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getProvinceCategories() {
    try {
      const response = await axios.get(this.baseUrl + "/api/monuments/provinces");
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async getMonumentWeather(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/monuments/" + id + "/weather");
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async fullyEditMonument(id, editedMonument) {
    try {
      let requestFormData = new FormData();
      requestFormData.append('title', String(editedMonument.title));
      requestFormData.append('description', String(editedMonument.description));
      requestFormData.append('latitude', String(editedMonument.coordinates.latitude));
      requestFormData.append('longitude', String(editedMonument.coordinates.longitude));
      requestFormData.append('county', String(editedMonument.county));
      requestFormData.append('province', String(editedMonument.province));
      // requestFormData.append('test', 'true');
      // const image = fs.createReadStream(path.join(__dirname, './testImages/castle.jpg'));
      requestFormData.append('imageUpload',  editedMonument.imageUpload);

      const response = await axios.put(this.baseUrl + "/api/monuments/" + id, requestFormData, {
        headers: requestFormData.getHeaders()
      });
      return response.data
    } catch (e) {
      return null;
    }
  }

  async partiallyEditMonument(id, fieldToEdit) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/monuments/" + id, fieldToEdit);
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
    requestFormData.append('latitude', newMonument.latitude);
    requestFormData.append('longitude', newMonument.longitude);
    requestFormData.append('county', String(newMonument.county));
    requestFormData.append('province', String(newMonument.province));
    requestFormData.append('imageUpload',  '');
    requestFormData.append('category', '');

    const response = await axios.post(this.baseUrl + "/api/monuments", requestFormData, {
      headers: requestFormData.getHeaders()
    });

    return response.data;
  }

  async createMonumentWithImage(newMonument) {
    let requestFormData = new FormData();
    requestFormData.append('title', String(newMonument.title));
    requestFormData.append('description', String(newMonument.description));
    requestFormData.append('latitude', newMonument.latitude);
    requestFormData.append('longitude', newMonument.longitude);
    requestFormData.append('county', String(newMonument.county));
    requestFormData.append('province', String(newMonument.province));
    const image = fs.createReadStream(path.join(__dirname, './testImages/castle.jpg'));
    requestFormData.append('imageUpload',  image);

    const response = await axios.post(this.baseUrl + "/api/monuments", requestFormData,  {
      headers: requestFormData.getHeaders()
    });

    return response.data;
  }

}

module.exports = MonumentService;