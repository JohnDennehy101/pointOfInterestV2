const Users = require('./app/api/accounts');
const Monuments = require('./app/api/monuments');

module.exports = [
  { method: 'GET', path: '/api/users', config: Users.find },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: "POST", path: "/api/users", config: Users.create },
  { method: "PUT", path: "/api/users/{id}", config: Users.edit },
  { method: "DELETE", path: "/api/users/{id}", config: Users.deleteOne },
  { method: "DELETE", path: "/api/users", config: Users.deleteAll },
  { method: 'GET', path: '/api/monuments', config: Monuments.find },
  { method: 'GET', path: '/api/monuments/{id}', config: Monuments.findOne },
  { method: 'GET', path: '/api/monuments/{id}/weather', config: Monuments.getMonumentWeather },
  { method: 'GET', path: '/api/monuments/{id}/images', config: Monuments.findMonumentImages },
  { method: 'GET', path: '/api/monuments/categories', config: Monuments.findNonProvinceCategories },
  { method: 'GET', path: '/api/monuments/provinces', config: Monuments.findProvinceCategories },
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate },
  { method: "POST", path: "/api/monuments", config: Monuments.create },
  { method: "PUT", path: "/api/monuments/{id}", config: Monuments.edit },
  { method: "DELETE", path: "/api/monuments/{id}", config: Monuments.deleteOne },
  { method: "DELETE", path: "/api/monuments", config: Monuments.deleteAll },

 ];