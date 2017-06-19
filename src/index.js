const shortid = require('shortid');
const ps = require('pubsub-js');

module.exports = class NodeBox {

	constructor( { name = shortid.generate(), step = (v)=>v }) {
		this.name = name;
		this.step = (...args) => Promise.resolve( typeof step === 'function' ? step.apply(null,args) : args);
		this.subSteps = [];
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

	input( someValue ) {
		this.recentInput = someValue;
		this.recentInputUpdated = '.pre';
		return this;
	}

	update() {
		ps.publish(this.pubName()+this.recentInputUpdated,this.recentInput);
		if ( this.recentInputUpdated === '.post' ) return Promise.resolve(this.latestOutput);
		if ( this.recentInputUpdated === '.run' ) return Promise.resolve(null);
		this.recentInputUpdated = '.run'; 
		return this.step(this.recentInput)
				.then((v) => {
					this.latestOutput = v;
					this.recentInputUpdated = '.post';
					ps.publish(this.pubName()+'.post',v);
					return this.latestOutput;
				})
	}

	process( someValue ) {
		return this.input(someValue).update();
	}

	output() {
		return this.recentInputUpdated ? this.latestOutput : null;
	}

};
