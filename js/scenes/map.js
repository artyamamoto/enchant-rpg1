
// enchant();

var MapScene = Class.create(Scene, {
	"initialize" : function(game) {
		Scene.call(this);
		
		this.game = game;
		
		this.map = RPGMap.Map.getInstance("field");
			
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
	"addCharacter" : function(chara) {
		this.stage().insertBefore(chara, this._map.createForeg);
	}, 
	"replaceScene" : function() {
		this.game.replaceScene(this);
	} , 
	"enterframe" : function() {
		var map = this.map;
		
		var x = Math.min( (this.game.width - 16)/2 - map.player.x ,0);
		var y = Math.min( (this.game.height - 16)/2 - map.player.y , 0 );
		x = Math.max(this.game.width , x + map.width) - map.width;
		y = Math.max(this.game.height, y + map.height) - map.height;
		this.scene.stage.x = x;
		this.scene.stage.y = y;
	}
});



