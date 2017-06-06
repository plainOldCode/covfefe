const Sequelize = require('sequelize');
module.exports = class Database {

	constructor( storagePath = ':memory:' ) {
		this.sequelize = new Sequelize('database', 'username', 'password', {
			host: 'localhost',
			dialect: 'sqlite',
			pool: {
				max: 5,
				min: 0,
				idle: 10000
			},
			// SQLite only
			storage: storagePath 
			//storage: './temp.db'
		});
		
		this.models = {};
	}

	testConnection() {
		return this.sequelize.authenticate();
	}

	defineModel({ name, schema }) {
		this.models[name] = this.sequelize.define( name, schema );
		return this.models[name];
	}
	
	getModel(name) {
		return this.models[name];
	}
};
