"use strict";

const axios = require("axios");
const baseUrl = "http://localhost:3000";

class AccountService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getUsers() {
    const response = await axios.get(this.baseUrl + "/api/users");
    return response.data;
  }

  async getUser(id) {
    try {
      const response = await axios.get(this.baseUrl + "/api/users/" + id);
      return response.data;
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async deleteAllUsers() {
    const response = await axios.delete(this.baseUrl + "/api/users");
    return response.data;
  }

  async deleteOneUser(id) {
    const response = await axios.delete(this.baseUrl + "/api/users/" + id);
    return response.data;
  }



  async createUser(newUser) {
    const response = await axios.post(this.baseUrl + "/api/users", newUser);
    return response.data;
  }
}

module.exports = AccountService;