

var FightScene = Class.create(Scene, {
	"initialize" : function(game,map) {
		Scene.call(this);
		this.backgroundColor = '#000000';
		
		this.game = game;
		this.map = map;
		
		var bg = new AvatarBG(1);
		bg.y = 50;
		
		var player = new Avatar("2:2:1:2004:21230:22480");
		player.scaleX = -1;
		player.scaleY = 1;
		player.x = 50;
		player.y = 100;
		player.addEventListener('enterframe' , function() {
			if (this.action == "run")
				bg.scroll(game.frame * 2);
			if (game.frame % 40 == 0) {
				switch(Math.floor(Math.random() * 3)) {
					case 0 : this.action = "run"; break;
					case 1 : this.action = "attack"; break;
					case 2 : this.action = "special"; break;
				}
				console.log(this.action);
			}
		});
		
		var monster = this.createMonster();
		
		var dialog = new Dialog(game, {"message":'ドラゴンが現れた！'});
		dialog.next();
							
		this.addChild(bg);
		this.addChild(player);
		this.addChild(monster);
		this.addChild(dialog);
		
		var progress = 0;		
		this.addEventListener('touchend' , function() {
			switch(progress) {
				case 0 :
					dialog.setMessage('ドラゴンをやっつけた！');
					dialog.next();
					monster.remove();
					progress = 1;
				break;
				case 1 :
					dialog.setMessage('30のけいけんちをてにいれた！');
					dialog.next();
					progress = 9; 
				break;
				case 9 :
					game.fps = 15;
					this.map.replaceScene();
				break;
			}
		});
	} ,
	"createMonster" : function() {
		var monster = new AvatarMonster(game.assets['monster/bigmonster1.gif']);
		monster.x = 200;
		monster.y = 100;
		return monster;
	}, 
	"replaceScene" : function() {
		game.fps = 36;
		this.game.replaceScene(this);
	}
});
