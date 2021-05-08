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

  async fullyEditUser(id, editedUser) {
    try {
      const response = await axios.put(this.baseUrl + "/api/users/" + id, editedUser);
      return response.data;
    } catch (e) {
      return null;
    }
  }
  async authenticate(user) {
    try {
      const response = await axios.post(this.baseUrl + "/api/users/authenticate", user);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async editUserFirstName(id, newFirstName) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/users/" + id, newFirstName);
      return response.data;
    } catch (e) {
      return null;
    }
  }
  async editUserLastName(id, newLastName) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/users/" + id, newLastName);
      return response.data;
    } catch (e) {
      return null;
    }
  }
  async editUserEmail(id, newEmail) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/users/" + id, newEmail);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async editUserPassword(id, newPassword) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/users/" + id, newPassword);
      return response.data;
    } catch (e) {
      return null;
    }
  }

  async editUserType(id, newUserType) {
    try {
      const response = await axios.patch(this.baseUrl + "/api/users/" + id, newUserType);
      return response.data;
    } catch (e) {
      return null;
    }
  }

}

module.exports = AccountService;