const shortid = require('shortid');
const ps = require('pubsub-js');

const _pubName = ( nb ) => {
	return nb.name + '-update';
};

const _subscribe = ( nb, { name, targetName, subscribeStep }) => {
	let chosen = nb.subscribeSteps.filter((v)=>v.targetName === targetName);
	if ( chosen.length <= 0) {
		let sub = ps.subscribe(name,subscribeStep);
		nb.subscribeSteps.push({ name : name, targetName : targetName, sub : sub });
	}
};

const _unsubscribe = ( nb, targetName ) => {
	let chosen = nb.subscribeSteps.filter((v)=>v.targetName === targetName);
	if ( chosen.length > 0 ) {
		ps.unsubscribe( chosen[0].sub );
		nb.subscribeSteps = nb.subscribeSteps.filter((v)=>!v.targetName === targetName);
	}
};

const _input = ( nb, value ) => {
	let order = { number : nb.orderCount++, value : value };
	ps.publish( _pubName(nb)+'.pre.'+order.number, order);
	return order;
};

const _update = ( nb, order ) => {
	if (!order) {
		ps.publish( _pubName(nb)+'.fail', 'NONE');
		return Promise.resolve(null);
	}
	ps.publish( _pubName(nb)+'.run.'+order.number, order);
	return nb.step(order.value)
			.then((resultValue) => {
				let processed = { number : order.number, value : order.value, done : resultValue }
				ps.publish( _pubName(nb)+'.post.'+order.number, processed );
				return nb.latestOutput = resultValue;
			})
};

class NodeBox {

	constructor( { name = shortid.generate(), step = (v)=>v }) {
		this.name = name;
		this.step = (...args) => Promise.resolve( typeof step === 'function' ? step.apply(null,args) : args);
		this.subscribeSteps = [];
		this.orderCount = 0;
		this.latestOutput = null;
	}

	flow( to ) {
		_subscribe( this, { name:_pubName(this)+'.post', targetName : _pubName(to) ,subscribeStep:(n,v)=>to.input(v.done)});
		return to;
	}

	close( to ){
		_unsubscribe( this, _pubName(to) );
		return to;
	}

	input( value ) {
		return _update(this,_input(this,value));
	}

	output() {
		return this.latestOutput;
	}

	halt() {
		this.subscribeSteps.forEach((v)=>{
			ps.unsubscribe( v.sub );
		});
		this.subscribeSteps = [];
	}

};

class StoreBox extends NodeBox {
	constructor({ name = shortid.generate() }) {
		super({ name : name });
		this.ordered = [];
	}

	pull( from ) {
		_subscribe( this, { name:_pubName(from)+'.post', targetName:_pubName(from) ,subscribeStep:(n,v)=>this.input(v)});
		return from;
	}

	stop( from ) {
		_unsubscribe( this , _pubName(from) );
		return from;
	}

	input( value ) {
		this.ordered.push(value);
		ps.publish(this.pushEventName(),'success');
	}

	output() {
		return this.ordered;
	}

	flush() {
		this.ordered = [];
	}

	pushEventName() {
		return _pubName(this)+'.pushed';
	}

};

class StoreControl extends NodeBox {
	constructor({ name = shortid.generate() }) {
		super({ name : name });
	}

	watch( store ) {
		_subscribe( this, { name:store.pushEventName(), targetName:_pubName(store) ,subscribeStep:(n,v)=>this.input(store)});
		return store;
	}

	input( store ) {
		console.log('please rewrite this function');
	}
}

class ControlTest extends StoreControl {
	
	constructor({ name = shortid.generate() }) {
		super({ name : name });
	}

	input( dog ) {
		if ( dog.ordered.length > 50 ){
			dog.halt();
		}
	}
};

exports.NodeBox = NodeBox;
exports.StoreBox = StoreBox;
exports.StoreControl = StoreControl;
exports.ControlTest = ControlTest;
