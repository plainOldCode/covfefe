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
			let n = new NodeBox({ step : (v) => v+1 });
			let m = new NodeBox({ step : (v) => v+1 });
			n.flow(m);
			n.close(m);
			return n.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert( m.output() === null);
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
	
	describe("Composite NodeBox and StoreBox", function() {
		it("connect 5 NodeBoxes", function(){
			let nodes = [];
			for (let i = 0; i < 5; i++ ){
				nodes.push(new NodeBox({}));
			}
			
			for (let i = 0; i < 4; i++ ){
				nodes[i].flow(nodes[i+1]);
			}

			return nodes[0].input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert(nodes[4].output() == 1979);
				});
		});

		it("connect 5 NodeBoxes and 1 StoreBox", function(){
			let nodes = [];
			for (let i = 0; i < 5; i++ ){
				nodes.push(new NodeBox({}));
			}
			
			for (let i = 0; i < 4; i++ ){
				nodes[i].flow(nodes[i+1]);
			}

			let s = new StoreBox({});

			s.pull(nodes[3]);
			s.pull(nodes[2]);

			return nodes[0].input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert(s.output().length == 2);
				});
		});

		it("connect many NodeBoxes and 1 StoreBox", function(){
			let A = new NodeBox({});
			let B = new NodeBox({});
			let C = new NodeBox({});
			let D = new NodeBox({});
			let E = new NodeBox({});
			let F = new NodeBox({});
			let G = new NodeBox({});
			
			let S = new StoreBox({});

			A.flow(B).flow(G);
			A.flow(C).flow(D).flow(G);
			A.flow(C).flow(E).flow(G);
			A.flow(C).flow(F).flow(G);

			S.pull(G);

			return A.input(1979)
				.then((v)=>{
					return new Promise((res,rej) => {
						setTimeout(()=>res(),100);
					});
				})
				.then(()=>{
					return assert(S.output().length == 4);
				});
		});
	});
}
