const DB = require('../lib');
const assert = require('assert');
const Sequelize = require('sequelize');

describe("Test code start",function() {
	it("Test code run",function() {
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
		
