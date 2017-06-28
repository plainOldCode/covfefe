const bigInt = require("big-integer");

const _fQueue = [];
_fQueue.push(bigInt(0));
_fQueue.push(bigInt(1));

const fibonaci = () => {
	let sum = _fQueue.reduce((p,v)=>bigInt(p).add(v),bigInt(0));
	_fQueue.shift();
	_fQueue.push(bigInt(sum));
	return sum;
}

class UnitGenerator {
	constructor (){

	}

	get () {
		let index = fibonaci();
		return {
			power : bigInt(index),
			price : bigInt(index).multiply(300)
		}
	}
}

exports.UnitGenerator = UnitGenerator;



