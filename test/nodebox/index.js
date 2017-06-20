const assert = require('assert');
const NodeBox = require('../../src');

module.exports = function() {

	describe("NodeBox runner",function() {
		it("Make NodeBox One",function() {
			let n = new NodeBox({});
			assert(n instanceof NodeBox );
		});

		it("Make NodeBox One and input something and output shoud be same",function() {
			let n = new NodeBox({});
			return n.input(1979)
				.then((v)=>{
					return assert(v === 1979);
				})
		});

		it("Inject process when Make NodeBox",function() {
			let n = new NodeBox({ step : (v)=>v+1 });
			return n.input(1979)
				.then((v)=>{
					return assert(v === 1980);
				})
		});

		it("run promise as a process in NodeBox.process", function() {
			let p = (v) => new Promise((res,rej)=>{
				res(v+1);
			});
			let n = new NodeBox({ step : p});
			return n.input(1979)
				.then((v)=>{
					return assert(v === 1980);
				})
		});

		it("get latestOutput if already updated as a process in NodeBox.process", function() {
			let p = (v) => new Promise((res,rej)=>{
				res(v+1);
			});
			let n = new NodeBox({ step : p});
			setTimeout(()=>{
				n.input(1979)
					.then((v)=>{
						return assert(v === 1980);
					})
			},1000)
		});


		it("flow NodeBox", function() {
			let n = new NodeBox({ step : (v) => v+1 });
			let m = new NodeBox({ step : (v) => v+1 });
			let m_orderNumber = m.getOrderNumber();
			n.flow(m);
			return n.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert( m.output(m_orderNumber) === 1981);
				});
		});

		it("close NodeBox", function() {
			let testValue = 'test value';
			let returnValue = '';
			let n = new NodeBox({});
			n.flow(n);
			n.close(n);
			return n.input(testValue)
				.then((v)=> {
					return new Promise((res,rej)=> {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{

					return assert(returnValue !== testValue);
				});
		});
	});
}
