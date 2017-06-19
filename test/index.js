const DB = require('../lib');
const assert = require('assert');
const Sequelize = require('sequelize');
const NodeBox = require('../src');

describe("Test code start",function() {
	it("Test code run",function() {
	});
});

describe("NodeBox runner",function() {
	it("Make NodeBox One",function() {
		let n = new NodeBox();
		assert(n instanceof NodeBox );
	});

	it("Make NodeBox One and input something and output shoud be same",function() {
		let n = new NodeBox();
		n.input(1979);
		return n.update()
			.then((v)=>{
				console.log(v)
				return assert(v === 1979);
			})
	});

	it("Inject process when Make NodeBox",function() {
		let n = new NodeBox((v)=>v+1);
		n.input(1979);
		return n.update()
			.then((v)=>{
				console.log(v);
				return assert(v === 1980);
			})
	});

	it("run promise as a process in NodeBox.process", function() {
		let p = (v) => new Promise((res,rej)=>{
			res(v+1);
		});
		let n = new NodeBox(p);
		n.input(1979);
		return n.update()
			.then((v)=>{
				console.log(v);
				return assert(v === 1980);
			})
	});
});

describe("Database behavior",function(){
	const db = new DB();	
	it("Create DB",function(){
		db.testConnection()
			.catch(err=>{
				console.log(err);
				assert(false);
			});
	});	

	it("Sync DB",function(){
		db.defineModel({ name : 'user', schema : {
				firstName : {
					type : Sequelize.STRING 
				},
				lastName : {
					type : Sequelize.STRING
				}
			}
		});

		return db.syncModels()
				.then(function(){
					console.log('create');
					let User = db.getModel('user');
					return User.create({ firstName : 'Obiwan', lastName : 'Kenobi'});
				})
				.then(()=>{
					let User = db.getModel('user');
					return User.findAll()
						.then(users=>{
							assert(users[0].firstName === 'Obiwan');
							assert(users[0].lastName === 'Kenobi');
						});
				})
				.catch(err => {
					console.error(err);
					assert(false);
				});
	});
});

//describe("Model behavior",function(){
//	it("Create schema",function(){
//	});
//
//	it("Put Model - insert",function(){
//	});
//
//	it("Put Model - update",function(){
//	});
//
//	it("Get Model",function(){
//	});
//});
		
