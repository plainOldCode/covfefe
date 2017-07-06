const assert = require('assert');
const PowerGenerator = require('../../src/ScenarioBox').PowerGenerator;
const CoinMiner = require('../../src/ScenarioBox').CoinMiner;
const CoinLink = require('../../src/ScenarioBox').CoinLink;
const Momentum = require('../../src/ScenarioBox').Momentum;
const TradingMarket = require('../../src/ScenarioBox').TradingMarket;

module.exports = function() {

	describe("Scenario runner",function() {
		it("PowerGenerator test",function(done) {
			let pg = new PowerGenerator();
			let cm = new CoinMiner();
			pg.connect(cm.plug);
			pg.start(10);
			setTimeout(function(){
				assert (cm.gpu.ordered.length > 10);
				done();
			},1000);
		});

		it("CoinLink test",function(done) {
			let cl = new CoinLink(100);
			assert ( cl.requiredCalcForce() === ( 1/ (100-1)));
			cl.addCoins(50);
			assert ( cl.requiredCalcForce() === ( 51/ (100-51)));
			done();
		});

		it("TradingMarket test",function(done) {
			let tm = new TradingMarket();
			let m = new Momentum({
				description : 'test momentum',
				direction : +1,
				quantity : 5
			})
			tm.applyMomentum(m);
			assert( tm.exchangeRate === 5.01 )
			done();
		});
	});
}
