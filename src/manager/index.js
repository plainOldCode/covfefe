const NodeBox = require('../base').NodeBox;
const StoreBox = require('../base').StoreBox;
const StoreControl = require('../base').StoreControl;

class StoreManager extends StoreControl {
	
	constructor() {
		super({});
		this.storeBoxes = [];
		this.archive = [];
		this.storeController = {};
	}

	watch ( nodeBox , storeController ) {
		let s = new StoreBox({});
		s.pull(nodeBox);
		nodeBox.store = s;
		super.watch(s);
		this.storeBoxes.push();
		this.storeController[s.name] = storeController
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
			timeStamp : new Date()
		};
		if (this.storeController[store.name]) {
			this.storeController[store.name].apply(null,[store]);
		} else {
			this.archive.push(item);
			store.flush();
		}
	}
}

class NodeBoxManager {
	constructor ( useTimer = true , timerDelay = 1000 ) {
		let that = this;
		const timerNode = new NodeBox({});
		this.storeManager = new StoreManager({});
		this.nodeBoxes = [];
		this.timerCount = 0;
		this.timerNode = timerNode;
		if ( useTimer) {
			this.timer = setInterval(()=>{
				timerNode.input(1);
				that.timerCount++;			
			},timerDelay);
		}
	}
	
	create ({ step = (v)=>v, controller = (v)=>console.log(v) }) {
		let n = new NodeBox({ step : step });
		this.timerNode.flow(n);
		this.nodeBoxes.push(n);
		this.storeManager.watch(n,controller);
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
