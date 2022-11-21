const http = require('http');
const app = require('./app');
const { HTTP_PORT } = require('./config/server.config');

server = http.createServer(app);

server.listen(HTTP_PORT, () => {
	console.log(`Running http server at localhost:${HTTP_PORT}`);
});