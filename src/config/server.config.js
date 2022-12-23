const dotenv = require('dotenv');

dotenv.config();

const env = process.env;

module.exports = {
    isDevelopment: env.NODE_ENV == 'development',
    HTTP_PORT: env.HTTP_PORT,
    CUSTOMER_SECRET: env.CUSTOMER_SECRET,
    USER_SECRET: env.USER_SECRET,
    JWT_SECRET: env.JWT_SECRET
}