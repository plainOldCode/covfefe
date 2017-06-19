module.exports = class NodeBox {

	constructor( step = (v)=>v ) {
		this.step = (...args) => Promise.resolve( typeof step === 'function' ? step.apply(null,args) : args);
	}

	input( someValue) {
		this.recentInput = someValue;
		this.recentInputUpdated = false;
	}

	update() {
		return this.step(this.recentInput)
				.then((v) => {
					this.latestOutput = v;
					this.recentInputUpdated = true;
					return this.latestOutput;
				});
	}

	output() {
		return this.recentInputUpdated ? this.latestOutput : null;
	}

};
