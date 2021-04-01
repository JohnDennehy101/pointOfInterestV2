const Users = require('./app/api/accounts');

module.exports = [
  { method: 'GET', path: '/api/users', config: Users.find }
 ];