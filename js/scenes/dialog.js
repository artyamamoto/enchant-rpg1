


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
	/**	
		var key_flg = 0;
		var key_init = false;
		this.addEventListener('enterframe' , function() {
				if (game.input.up || game.input.down || game.input.left || game.input.right) {
					if (key_init == true && key_flg++ % 8 == 7) {
						key_init = false;
						that.next();
					}
				} else {
					key_flg = 0;
					key_init = true;
				}
		});
		**/
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
		this._window.remove();
		this._window = null;
		setTimeout( function() {
			this.game.popScene();
		}, 500);
	}
});

