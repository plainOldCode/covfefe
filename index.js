const argv = require('optimist')
			.default('e','local')
			.argv;

let msg = 'covfefe';

let count = 0;
const getTick = ()=>count++;

const Sequelize = require('sequelize');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const Database = require('./lib');
const db = new Database(argv.e);

db.defineModel({
	name : 'server_logs',
	schema : {
		url : {
			type : Sequelize.STRING
		},
		params : {
			type :Sequelize.STRING
		}
	}
});

const startServer = ()=>{
	const server_logs = db.getModel('server_logs');
	app.set('port', (process.env.PORT || 5000));

	//app.use(express.static(__dirname + '/public'));

	// views is directory for all template files
	//app.set('views', __dirname + '/views');
	//app.set('view engine', 'ejs');
		//

	app.use(cookieParser());

	app.get('/', (req, res, next) => {
		res.json({ msg : msg, tick : getTick(), date : new Date()});
		next();
	},(req, res, next) => {
		server_logs.create({
			url : req.url,
			params : count
		});
		next();
	});
		
	app.get('/report',(req,res) => {
		server_logs.findAll({ limit : 5, order: 'createdAt DESC' })
			.then((data)=>{
				res.json({ data : data});
			});
	});

	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});
}

db.syncModels()
	.then(()=>startServer());

