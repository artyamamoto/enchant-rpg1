

var TitleScene = Class.create(Scene, {
	"initialize" : function(game) {
		Scene.call(this);
		this.game = game;
		this.backgroundColor  = 'rgba(0,0,0,1)';
		
		var sf = new Surface(256, 112);
		sf.draw(game.assets['dq_title.png'], 0, 0, 512, 224, 0, 0, 256, 112);
			
		var img = new Sprite(256, 112);
		img.image = sf;
		img.x = (game.width - 256) / 2;
		
			
		var start = new Label();
		start.font = '20px monospace';
		start.color = 'white';
		start.text = 'START';
		start.y = 180;
		start.x = (game.width - start._boundWidth) / 2;
		
		this.addChild(img);
		this.addChild(start);
	} , 
	"replaceScene" : function() {
		this.game.replaceScene(this);
	}
});
