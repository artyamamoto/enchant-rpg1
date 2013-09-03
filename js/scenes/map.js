
// enchant();

var MapScene = Class.create(Scene, {
	"initialize" : function(game) {
		Scene.call(this);
		
		this.game = game;
		
		this.map = MyMap.getInstance("field");
		this.player = new Player(this.map);
		
		this.stage = new Group();
		this.stage.addChild(this.map);
		this.stage.addChild(this.player);
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
		var x = Math.min( (this.game.width - 16)/2 - this.player.x ,0);
		var y = Math.min( (this.game.height - 16)/2 - this.player.y , 0 );
		x = Math.max(this.game.width , x + this.map.width) - this.map.width;
		y = Math.max(this.game.height, y + this.map.height) - this.map.height;
		this.scene.stage.x = x;
		this.scene.stage.y = y;
	}
});



