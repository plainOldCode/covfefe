const NodeBox = require('./src').NodeBox;
const StoreBox = require('./src').StoreBox;


let n = new NodeBox({ step : (v) => v+1 });
let m = new NodeBox({ step : (v) => v+1 });
n.flow(m);
n.input(1979)
	.then((v)=>{
		return new Promise((res,rej) => {
			setTimeout(()=>res(),100);
		});
	})
	.then(()=>{
		console.log(m);
	});
