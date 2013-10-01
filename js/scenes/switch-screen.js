


var SwitchScreenScene = Class.create(Scene, {
	"initialize" : function(game, callback) {
		Scene.call(this);
		this.game = game;
		var sp = new Sprite(game.width, game.height);
		var sf = new Surface(game.width, game.height);
		sp.image = sf;
		this.addChild(sp);
		
		var fps_org = game.fps;
		game.fps = 64;
		var frame = 0;
		this.addEventListener("enterframe" , function() {
			frame++;
			
			sf.context.fillStyle = 'rgb(0,0,0)';
			var center = (game.width / 2);
			var w = (game.width / 2 / 10) * frame;
			
			sf.context.fillRect(center - w,0,w,game.height);
			sf.context.fillRect(center,0,w,game.height);
			
			if (frame == 14) {
				game.fps = fps_org;
				callback();
			}
		});	
		this.game.pushScene(this);
	} 
});

