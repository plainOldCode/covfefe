const NodeBox = require('../base').NodeBox;
const StoreBox = require('../base').StoreBox;

class PowerGenerator {
	constructor () {
		this.socket = new NodeBox({});
	}

	start ( interval = 1000 ) {
		let that = this;
		that.timer = setInterval(()=>{
			that.socket.input(1);
		},interval);
	}

	stop () {
		clearInterval( this.timer );
	}

	connect ( plug ) {
		this.socket.flow( plug );
	}

	disconnect ( plug ) {
		this.socket.close( plug );
	}
}

class CoinMiner {
	//calculating force
	//power * calculating force => coin!
	constructor ( calcForce = 1 ) {
		this.calcForce = calcForce;
		this.plug = new NodeBox({});
		this.gpu = new StoreBox({});
		this.gpu.pull(this.plug);
	}

	calculate ( requireCalcForce ) {
		if ( !requireCalcForce ) return 0;
		let coins = this.gpu.ordered.length * ( this.calcForce / requireCalcForce );
		this.gpu.flush();
		return coins;
	}
}

class CoinLink {
	constructor ( hashSize ) {
		this.hashSize = hashSize;
		this.generatedCoins = 1;
	}

	addCoins ( coins ) {
		this.generatedCoins += coins;
	}

	requiredCalcForce () {
		return this.generatedCoins / ( this.hashSize - this.generatedCoins );
	}

}

class Wallet {
	//save coin
	//saving coin from all of coin miner
	constructor () {
		this.coins = 0;
	}

	deposit ( coins ) {
		this.coins += coins;
	}

	withdraw ( coins ) {
		this.coins -= coins;
	}
	
}

class Momentum {
	constructor ({ description , direction, quantity }) {
		this.description = description;
		this.direction = direction;	
		this.quantity = quantity;
	}
}

class TradingMarket {
	//trade coin with real-money
	//coin from coinWallet and real-money from SomeWhere~~
	constructor ( exchangeRate = 0.01 ) {
		this.baseExchangeRate = exchangeRate;
		this.exchangeRate = exchangeRate;
	}

	applyMomentum ( momentum ) {
		this.exchangeRate =	this.exchangeRate + ( momentum.direction * momentum.quantity ); 
		if ( this.exchangeRate < this.baseExchangeRate ) this.exchangeRate = this.baseExchangeRate;
	}
}

exports.PowerGenerator = PowerGenerator;
exports.CoinMiner = CoinMiner;
exports.CoinLink = CoinLink;
exports.Wallet = Wallet;
exports.Momentum = Momentum;
exports.TradingMarket = TradingMarket;
