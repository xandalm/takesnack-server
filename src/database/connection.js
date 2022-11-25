const { isDevelopment } = require('../config/server.config');

const knex = require('knex');
const config = require('../../knexfile');

const connection = isDevelopment? knex(config.development) : knex(config.production);
    
module.exports = connection;
