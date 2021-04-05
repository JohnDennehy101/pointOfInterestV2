const Users = require('./app/api/accounts');
const Monuments = require('./app/api/monuments');

module.exports = [
  { method: 'GET', path: '/api/users', config: Users.find },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: "POST", path: "/api/users", config: Users.create },
  { method: "DELETE", path: "/api/users/{id}", config: Users.deleteOne },
  { method: "DELETE", path: "/api/users", config: Users.deleteAll },
  { method: 'GET', path: '/api/monuments', config: Monuments.find },
  { method: 'GET', path: '/api/monuments/{id}', config: Monuments.findOne },
  { method: "POST", path: "/api/monuments", config: Monuments.create },
  { method: "DELETE", path: "/api/monuments/{id}", config: Monuments.deleteOne },
  { method: "DELETE", path: "/api/monuments", config: Monuments.deleteAll },

 ];