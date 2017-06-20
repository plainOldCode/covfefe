const shortid = require('shortid');
const ps = require('pubsub-js');

const pubName = ( nb ) => {
	return nb.name + '-update';
};

const subscribe = ( nb, { name, subStep }) => {
	nb.subSteps.push({
		name : name,
		sub : ps.subscribe(name,subStep)
	});
};

const unsubscribe = ( nb, name ) => {
	let chosen = nb.subSteps.filter((v)=>v.name === name);
	if ( chosen.length > 0 ) 
		ps.unsubscribe( chosen[0].sub );
};

const update = ( nb, order ) => {
	if (!order) {
		ps.publish(pubName(nb)+'.fail','NONE');
		return Promise.resolve(null);
	}
	ps.publish(pubName(nb)+'.run.'+order.number,order);
	return nb.step(order.value)
			.then((v) => {
				let processed = {
					number : order.number,
					value : order.value,
					done : v
				}
				nb.ordered.push(processed);
				let publishName = pubName(nb)+'.post.'+order.number;
				ps.publish(publishName,processed);
				return v;
			})
};

module.exports = class NodeBox {

	constructor( { name = shortid.generate(), step = (v)=>v }) {
		this.name = name;
		this.step = (...args) => Promise.resolve( typeof step === 'function' ? step.apply(null,args) : args);
		this.subSteps = [];
		this.orderCount = 0;
		this.ordered = [];
	}

	flow( to ) {
		subscribe( this, { name:pubName(this)+'.post', subStep:(n,v)=>to.input(v.done)});
	}

	close( to ){
		unsubscribe( to, pubName(this)+'.post' );
	}

	getOrderNumber() {
		return this.orderCount;
	}

	input( inputValue ) {
		let order = {
			number : this.orderCount++,
			value : inputValue
		};

		ps.publish(pubName(this)+'.pre.'+order.number,order);
		return update(this,order);
	}

	output( orderNumber ) {
		let o = this.ordered.filter((v)=>v.number===orderNumber);
		return o.length <= 0 ? 'NOT EXIST' : (o[0].done ? o[0].done : 'NOT YET');
	}

};
