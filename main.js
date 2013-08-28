
// enchant();

var game = game || {};

window.onload = function() {
	game = new Game(configs.game.width,configs.game.height);
	game.keybind(88,'a'); // X
	game.keybind(90,'b'); // Z
	game.fps = 15;
	game.preload('map0.gif','chara0.gif','dq_title.png');
	game.onload = function() {
		var title = new TitleScene(game);
		var map = new MapScene(game);
			
		title.replaceScene();
		title.addEventListener("touchstart" , function() {
			/**
			var p = new PromptScene('名前を入力してください', 'OK', 'cancel','名前');
			p.callback = function(name) {
				if (name) {
					map.player.name = name;
					map.replaceScene();
				} else {
					game.pushScene(p);
				}
			};
			game.pushScene(p);
			**/
			var showprompt = function(callback) {
				// prompt() 関数だと未入力の場合に、do{}while(name) などでまわすと
				// ブラウザ側で「表示しない」とした場合に無限ループになる。
				jQuery.showalert({
					"type" : "prompt" , 
					"title" : "名前を入力してください。",
					"value" : "名無し" , 
					"ok" : '&nbsp;OK&nbsp;',
					"cancel" : null,
					"callback" : function(name) {
						if (name) 
							callback(name);
						else 
							showprompt(callback);
					} 
				});
			};
			showprompt(function(name) {
				map.player.name = name;
				map.replaceScene();
			});
		});
	};
	jQuery.post( configs.ajax.map.field, {}, function(data) {
		console.log(data);
		configs.map.field = data;
		game.start();
	} , "json");
};
