
// enchant();

var MapScene = Class.create(Scene, {
	"initialize" : function(game, type) {
		Scene.call(this);
		
		this.type = type || "field";
		this.game = game;
		
		this.map = RPGMap.Map.getInstance(this.type);
			
		this.stage = new Group();
		this.characters = new Group();
		this.characters.addChild(this.map.player);		
		for (var i=this.map.characters.length-1;i >=0; i--) 
			this.characters.addChild( this.map.characters[i] );		

		this.stage.addChild(this.map);
		this.stage.addChild(this.characters);
		this.stage.addChild(this.map.createForegroundMap());
		
		
		this.pad = new Pad();
		this.pad.x = 0;
		this.pad.y = 220;

		this.addChild(this.stage);
		this.addChild(this.pad);
		
		
		this.addEventListener('enterframe' , this.enterframe);		
	} ,
	"replaceScene" : function() {
		this.game.replaceScene(this);
	} , 
	"enterframe" : function() {
		var map = this.map;
		
		var x = Math.min( (this.game.width - 16)/2 - map.player.x ,0);
		var y = Math.min( (this.game.height - 16)/2 - map.player.y , 0 );
		x = Math.max(this.game.width , x + map.width) - map.width;
		y = Math.max(this.game.height, y + map.height) - map.height;
		
		this.stage.x = x;
		this.stage.y = y;
	}
});
MapScene._maps = {};
MapScene.getScene = function(type) {
	if (! MapScene._maps[type]) {
		MapScene._maps[type] = new MapScene(game, type);		
	}
	return MapScene._maps[type];
};
MapScene.pushScene = function(type) {
	game.pushScene( MapScene.getScene(type) );
};
MapScene.popScene = function() {
	game.popScene();
};
