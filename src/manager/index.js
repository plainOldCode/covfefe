const NodeBox = require('../base').NodeBox;
const StoreBox = require('../base').StoreBox;
const StoreControl = require('../base').StoreControl;

class StoreManager extends StoreControl {
	
	constructor() {
		super({});
		this.storeBoxes = [];
		this.archive = [];
	}

	watch ( nodeBox ) {
		let s = new StoreBox({});
		s.pull(nodeBox);
		nodeBox.store = s;
		super.watch(s);
		this.storeBoxes.push();
	}

	unwatch ( store ) {
		let chosenStore = this.storeBoxes.filter( (v)=>v.name === store.name );
		if ( chosenStore.length > 0 ) {
			this.storeBoxes = this.storeBoxes.filter( (v)=>v.name != store.name );
			chosenStore[0].halt();
		}
	}
	
	input ( store ) {
		let item = {
			storeName : store.name,
			ordered : store.output(),
			timeStamp : process.hrtime()
		};
		this.archive.push(item);
		store.flush();
	}
}

class NodeBoxManager {
	constructor ( timerDelay = 1000 ) {
		let that = this;
		const timerNode = new NodeBox({});
		this.storeManager = new StoreManager({});
		this.nodeBoxes = [];
		this.timerCount = 0;
		this.timerNode = timerNode;
		this.timer = setInterval(()=>{
			timerNode.input(1);
			that.timerCount++;			
		},timerDelay);
	}
	
	create () {
		let n = new NodeBox({});
		this.timerNode.flow(n);
		this.nodeBoxes.push(n);
		this.storeManager.watch(n);
		return n;
	}

	remove ( n ) {
		let chosenNode = this.nodeBoxes.filter( (v)=>v.name === n.name );
		if ( chosenNode.length > 0 ) {
			this.nodeBoxes = this.nodeBoxes.filter( (v)=>v.name != n.name );
			this.timerNode.close( chosenNode[0] );
			chosenNode[0].halt();
			this.storeManager.unwatch(chosenNode[0].store);
			chosenNode[0].store = null;
		}
	}

	removeAll () {
		this.nodeBoxes.forEach( (v)=> {
			this.timerNode.close( v );
			v.halt();
			this.storeManager.unwatch( v.store );
			v.store = null;
		})
		this.nodeBoxes = [];
	}
}	


exports.NodeBoxManager = NodeBoxManager;
