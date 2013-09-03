
var ConfigScene = Class.create(Scene, {
	"initialize" : function(game) {
		Scene.call(this);
		this.game = game;
		
		//var dialog = new Dialog(game, {"message" : "お名前を入力してください。"});	
		var p = new Prompt(game,this, {"message" : "お名前を入力してください。"});
		//var input = new InputTextBox();
		//this.addChild(dialog); 
		//this.addChild(input);
		this.addChild(p);
	}  ,
	"replaceScene" : function() {
		this.game.replaceScene(this);
	}
});
