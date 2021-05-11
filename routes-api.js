const Users = require('./app/api/accounts');
const Monuments = require('./app/api/monuments');

module.exports = [
  { method: 'GET', path: '/api/users', config: Users.find },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: "POST", path: "/api/users", config: Users.create },
  { method: "PUT", path: "/api/users/{id}", config: Users.edit },
  { method: "PATCH", path: "/api/users/{id}", config: Users.partiallyEdit },
  { method: "DELETE", path: "/api/users/{id}", config: Users.deleteOne },
  { method: "DELETE", path: "/api/users", config: Users.deleteAll },
  { method: 'GET', path: '/api/monuments', config: Monuments.find },
  { method: 'GET', path: '/api/monuments/{id}', config: Monuments.findOne },
  { method: 'GET', path: '/api/monuments/{id}/weather', config: Monuments.getMonumentWeather },
  { method: 'GET', path: '/api/monuments/{id}/images', config: Monuments.findMonumentImages },
  { method: 'GET', path: '/api/monuments/categories', config: Monuments.findNonProvinceCategories },
  // { method: 'POST', path: '/api/monuments/test', config: Monuments.test },
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate },
  // { method: 'PATCH', path: '/api/monuments/{id}/images', config: Monuments.addMonumentImages },
  { method: "POST", path: "/api/monuments", config: Monuments.create },
  { method: "PUT", path: "/api/monuments/{id}", config: Monuments.edit },
  { method: "PATCH", path: "/api/monuments/{id}", config: Monuments.partiallyEdit },
  { method: "DELETE", path: "/api/monuments/{id}", config: Monuments.deleteOne },
  { method: "DELETE", path: "/api/monuments", config: Monuments.deleteAll },

 ];