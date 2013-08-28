


var DialogScene = Class.create(Scene, {
	"initialize" : function(game, options) {
		Scene.call(this);
		this.game = game;
		this._window = new Dialog(game,options);
		this.addChild(this._window);
		
		var that = this;
		this.addEventListener('touchend' , function() {
			that.next();
		});
	} , 
	"next" : function() {
		if (! this._window.next()) 
			this.hide();
	},
	"show" : function() {
		this.game.pushScene(this);
		this.next();
	} , 
	"hide" : function() {
		this.game.popScene();
	}
});

