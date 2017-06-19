const DB = require('../lib');
const assert = require('assert');
const Sequelize = require('sequelize');
const NodeBox = require('../src');

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

describe("NodeBox runner",function() {
	it("Make NodeBox One",function() {
		let n = new NodeBox({});
		assert(n instanceof NodeBox );
	});

	it("Make NodeBox One and input something and output shoud be same",function() {
		let n = new NodeBox({});
		n.input(1979);
		return n.update()
			.then((v)=>{
				return assert(v === 1979);
			})
	});

	it("Inject process when Make NodeBox",function() {
		let n = new NodeBox({ step : (v)=>v+1 });
		n.input(1979);
		return n.update()
			.then((v)=>{
				return assert(v === 1980);
			})
	});

	it("run promise as a process in NodeBox.process", function() {
		let p = (v) => new Promise((res,rej)=>{
			res(v+1);
		});
		let n = new NodeBox({ step : p});
		n.input(1979);
		return n.update()
			.then((v)=>{
				return assert(v === 1980);
			})
	});

	it("get latestOutput if already updated as a process in NodeBox.process", function() {
		let p = (v) => new Promise((res,rej)=>{
			res(v+1);
		});
		let n = new NodeBox({ step : p});
		n.input(1979);
		n.update();
		setTimeout(()=>{
			return n.update()
				.then((v)=>{
					return assert(v === 1980);
				})
		},1000)
	});

	it("subscribe event in NodeBox", function() {
		let testValue = 'test value';
		let returnValue = '';
		let n = new NodeBox({});
		n.sub({ name : n.pubName(), subStep : (name ,value) => returnValue = value });
		n.input(testValue);
		return n.update()
			.then((v)=> {
				return new Promise((res,rej)=> {
					setTimeout(()=>res(v),1000);
				});
			})
			.then((v)=>{
				return assert(returnValue === testValue);
			});
	});
	
	it("subscribe event from other NodeBox", function() {
		let n = new NodeBox({ step : (v) => v+1 });
		let m = new NodeBox({ step : (v) => v+1 });
		n.input(1979);
		m.sub({ name : n.pubName()+'.post', subStep : (n,v)=>m.process(v)});
		return n.update()
			.then((v)=>{
				return new Promise((res,rej) => {
					setTimeout(()=>res(m.update()),1000);
				});
			})
			.then((v)=>{
				return assert( v === 1981);
			});
	});

	it("unsubscribe event in NodeBox", function() {
		let testValue = 'test value';
		let returnValue = '';
		let n = new NodeBox({});
		n.sub({ name : n.pubName(), subStep : (name ,value) => returnValue = value });
		n.unSub( n.pubName() );
		n.input(testValue);
		return n.update()
			.then((v)=> {
				return new Promise((res,rej)=> {
					setTimeout(()=>res(v),1000);
				});
			})
			.then((v)=>{
				return assert(returnValue !== testValue);
			});
	});
});
