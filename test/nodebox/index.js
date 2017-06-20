const assert = require('assert');
const NodeBox = require('../../src').NodeBox;
const StoreBox = require('../../src').StoreBox;

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
			n.flow(m);
			return n.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert( m.output() === 1981);
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

	describe("StoreBox runner", function() {
		it("Make StoreBox One",function() {
			let n = new StoreBox({});
			assert(n instanceof StoreBox );
		});

		it("pull from NodeBox", function() {
			let n = new NodeBox({ step : (v) => v+1 });
			let s = new StoreBox({});
			s.pull(n);
			return n.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert(s.ordered.length >= 1);
				});
		});

		it("pull from NodeBox series", function() {
			let n = new NodeBox({ step : (v) => v+1 });
			let m = new NodeBox({ step : (v) => v+2 });
			let s = new StoreBox({});
			s.pull(n);
			s.pull(m);
			m.input(1979);
			return n.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert(s.ordered.length >= 2);
				});
		});

		it("pull stop from NodeBox ", function() {
			let n = new NodeBox({ step : (v) => v+1 });
			let m = new NodeBox({ step : (v) => v+2 });
			let s = new StoreBox({});
			s.pull(n);
			s.pull(m);
			s.stop(m);
			m.input(1979);
			return n.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert(s.ordered.length == 1);
				});
		});
	});
}
