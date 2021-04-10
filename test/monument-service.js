"use strict";

const axios = require("axios");
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



  async createMonument(newUser) {
    const response = await axios.post(this.baseUrl + "/api/monuments", newUser);
    return response.data;
  }

}

module.exports = MonumentService;