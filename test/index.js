const dbTest = require('./db');
const nodeBoxTest = require('./nodebox');
const ScenarioBoxTest = require('./scenario');

describe("Test code start",function() {
	it("Test code run",function(done) {
		done();
	});
});

dbTest();

nodeBoxTest();

ScenarioBoxTest();
