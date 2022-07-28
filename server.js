const express = require('express');
const cors = require('cors');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const api = require('./src/api');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
	res.json({ message: 'Node APIs for Postal Code Project !' });
});

//our url will always start with api
app.use('/api', api);
app.use('/', router);

app.use(function(req, res, next) {
	res.status(404);
	res.send({
		"success" : false,
		"message" : 'Invalid URL'
	});
});

app.use((err, req, res, next) => {
    res.status(err.status).json({
				"success" : false,
				"name" : err.name,
				"message": err.message,
				"code": err.code
			});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('listening in http://localhost:' + port);
});
