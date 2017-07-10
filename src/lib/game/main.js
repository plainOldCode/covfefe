ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'impact.entity'
)
.defines(function(){

iPowerEffect = ig.Entity.extend({
	size : { x : 16, y: 16 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/powerimage.png',16,16),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
	},

	update : function () {
		//this.parent();
	}
});

iPowerGenerator = ig.Entity.extend({
	size : { x : 32, y: 32 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/powergenerator.png',32,32),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
		this.count = 0;
		this.effect = null;
	},

	addEffect : function (entityGenerator) {
		this.entityGenerator = entityGenerator;
	},

	update : function () {
		this.parent();
		this.count++;
		if ( this.count == 120 ) {
			this.count = 0;
			if (!this.effect) {
				this.effect = this.entityGenerator();
			} else {
				this.effect.kill();
				this.effect = null; 
			}
		}
	}
});

iCoinEffect = ig.Entity.extend({
	size : { x : 16, y: 16 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/coinimage.png',16,16),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
	},

	update : function () {
		this.parent();
	}
});

iGPU = ig.Entity.extend({

	size : { x : 32, y: 32 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/gpu.png',32,32),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
		this.count = 0;
		this.effect = null;
	},

	addEffect : function (entityGenerator) {
		this.entityGenerator = entityGenerator;
	},

	update : function () {
		this.parent();
		this.count++;
		if ( this.count == 120 ) {
			this.count = 0;
			if (!this.effect) {
				this.effect = this.entityGenerator();
			} else {
				this.effect.kill();
				this.effect = null; 
			}
		}
	}
});


iCoin = ig.Entity.extend({
	size : { x : 32, y: 32 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/coin.png',32,32),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
	},

	update : function () {
		this.parent();
	}
});


iRealMoney = ig.Entity.extend({
	size : { x : 32, y: 32 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/realmoney.png',32,32),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
	},

	update : function () {
		this.parent();
	}
});

iTradeMarket = ig.Entity.extend({
	size : { x : 32, y: 32 },
	offset : { x : 0, y: 0 },
	animSheet : new ig.AnimationSheet('media/trademarket.png',32,32),

	init : function (x,y,settings) {
		this.addAnim('idle',0.1,[0]);
		this.parent(x,y,settings);
	},

	update : function () {
		this.parent();
	}
});

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	
	init: function() {
		// Initialize your game here; bind keys etc.
		this.powergenerator = this.spawnEntity(iPowerGenerator,ig.system.width/2-32,ig.system.height/2);
		this.powergenerator.addEffect(()=>this.spawnEntity(iPowerEffect,ig.system.width/2-32-32,ig.system.height/2));
		this.gpu = this.spawnEntity(iGPU,ig.system.width/2,ig.system.height/2);
		this.gpu.addEffect(()=> this.spawnEntity(iCoinEffect,ig.system.width/2+32,ig.system.height/2+32));
		this.coin = this.spawnEntity(iCoin,ig.system.width/2+32,ig.system.height/2);
		this.realmoney = this.spawnEntity(iRealMoney,ig.system.width/2-32,ig.system.height/2+32);
		this.trademarket = this.spawnEntity(iTradeMarket,ig.system.width/2,ig.system.height/2+32);
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		// Add your own drawing code here
		var x = ig.system.width/2,
			y = ig.system.height/2;
		
		this.font.draw( 'It Works!', x, y, ig.Font.ALIGN.CENTER );
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 320, 240, 2 );

});

