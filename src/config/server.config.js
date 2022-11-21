const dotenv = require('dotenv');

dotenv.config();

const env = process.env;

module.exports = {
    isDevelopment: env.NODE_ENV == 'development',
    HTTP_PORT: env.HTTP_PORT,
}