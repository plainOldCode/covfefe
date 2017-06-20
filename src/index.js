const shortid = require('shortid');
const ps = require('pubsub-js');

const _pubName = ( nb ) => {
	return nb.name + '-update';
};

const _subscribe = ( nb, { name, subscribeStep }) => {
	nb.subscribeSteps.push({
		name : name,
		sub : ps.subscribe(name,subscribeStep)
	});
};

const _unsubscribe = ( nb, name ) => {
	let chosen = nb.subscribeSteps.filter((v)=>v.name === name);
	if ( chosen.length > 0 ) 
		ps.unsubscribe( chosen[0].sub );
};

const _input = ( nb, value ) => {
	let order = {
		number : nb.orderCount++,
		value : value
	};

	ps.publish(_pubName(nb)+'.pre.'+order.number,order);
	return order;
};

const _update = ( nb, order ) => {
	if (!order) {
		ps.publish(_pubName(nb)+'.fail','NONE');
		return Promise.resolve(null);
	}
	ps.publish(_pubName(nb)+'.run.'+order.number,order);
	return nb.step(order.value)
			.then((resultValue) => {
				let processed = {
					number : order.number,
					value : order.value,
					done : resultValue
				}
				nb.latestOutput = resultValue;
				let publishName = _pubName(nb)+'.post.'+order.number;
				ps.publish(publishName,processed);
				return resultValue;
			})
};

const NodeBox = class NodeBox {

	constructor( { name = shortid.generate(), step = (v)=>v }) {
		this.name = name;
		this.step = (...args) => Promise.resolve( typeof step === 'function' ? step.apply(null,args) : args);
		this.subscribeSteps = [];
		this.orderCount = 0;
		this.latestOutput = null;
	}

	flow( to ) {
		_subscribe( this, { name:_pubName(this)+'.post', subscribeStep:(n,v)=>to.input(v.done)});
	}

	close( to ){
		_unsubscribe( to, _pubName(this)+'.post' );
	}

	input( value ) {
		return _update(this,_input(this,value));
	}

	output() {
		return this.latestOutput;
	}

};

const StoreBox = class StoreBox extends NodeBox {
	constructor({ name = shortid.generate() }) {
		super({ name : name });
		this.ordered = [];
	}

	pull( from ) {
		_subscribe( this, { name:_pubName(from)+'.post', subscribeStep:(n,v)=>this.input(v)});
	}

	stop( from ) {
		_unsubscribe( this, _pubName(from)+'.post' );
	}

	input( value ) {
		this.ordered.push(value);
		ps.publish(_pubName(this)+'.pushed','success');
	}

	output() {
		return this.ordered;
	}

};

exports.NodeBox = NodeBox;
exports.StoreBox = StoreBox;
