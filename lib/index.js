const Sequelize = require('sequelize');
module.exports = class Database {

	constructor( type = 'local', storagePath = ':memory:' ) {
		if ( type === 'heroku' ) {
			this.sequelize = new Sequelize(process.env.DATABASE_URL, {
				logging: false,
				dialectOptions: {
					ssl: true /* for SSL config since Heroku gives you this out of the box */
				}
			});
		} else {
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
		}
		
		this.models = {};
	}

	testConnection() {
		return this.sequelize.authenticate();
	}

	syncModels() {
		return Promise.all(Object.keys(this.models).map((k)=>this.models[k].sync()));
	}

	defineModel({ name, schema }) {
		this.models[name] = this.sequelize.define( name, schema );
		return this.models[name];
	}
	
	getModel(name) {
		return this.models[name];
	}
};
