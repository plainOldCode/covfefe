const shortid = require('shortid');
const ps = require('pubsub-js');

module.exports = class NodeBox {

	constructor( { name = shortid.generate(), step = (v)=>v }) {
		this.name = name;
		this.step = (...args) => Promise.resolve( typeof step === 'function' ? step.apply(null,args) : args);
		this.subSteps = [];
		this.orderCount = 0;
		this.orders = [];
		this.ordered = [];
	}

	pubName() {
		return this.name + '-update';
	}

	sub({ name , subStep }) {
		this.subSteps.push({
			name : name,
			sub : ps.subscribe(name,subStep)
		});
	}

	unSub(name) {
		let chosen = this.subSteps.filter((v)=>v.name === name);
		if ( chosen.length > 0 ) 
			ps.unsubscribe( chosen[0].sub );
	}

	getOrderNumber() {
		return this.orderCount;
	}

	input( inputValue ) {
		let order = {
			number : this.orderCount++,
			value : inputValue
		};

		this.orders.push(order);
		ps.publish(this.pubName()+'.pre.'+order.number,order);
		return this._update();
	}

	_update() {
		let order = this.orders.shift();
		if (!order) return Promise.resolve(null);
		ps.publish(this.pubName()+'.run.'+order.number,order);
		return this.step(order.value)
				.then((v) => {
					let processed = {
						number : order.number,
						value : order.value,
						done : v
					}
					this.ordered.push(processed);
					let pubName = this.pubName()+'.post.'+order.number;
					ps.publish(pubName,processed);
					return v;
				})
	}

	output( orderNumber ) {
		let o = this.ordered.filter((v)=>v.number===orderNumber);
		return o.length <= 0 ? 'NOT EXIST' : (o[0].done ? o[0].done : 'NOT YET');
	}

};
