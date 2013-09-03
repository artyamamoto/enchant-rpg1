
// enchant();

var game = game || {};

window.onload = function() {
	game = new Game(configs.game.width,configs.game.height);
	game.keybind(88,'a'); // X
	game.keybind(90,'b'); // Z
	game.fps = 15;
	game.preload(
		'map0.gif',
		'chara0.gif',
		'dq_title.png' ,
		'avatarBg1.png',
		'avatarBg2.png',
		'avatarBg3.png',
		'monster/bigmonster1.gif'
	);
	game.onload = function() {
		var title = new TitleScene(game);
		var map = new MapScene(game);
		
		configs.scenes = {};
		configs.scenes.title = title;
		configs.scenes.map = map;
			
		title.replaceScene();
		title.addEventListener("touchstart" , function() {
			var showprompt = function(callback) {
				// prompt() 関数だと未入力の場合に、do{}while(name) などでまわすと
				// ブラウザ側で「表示しない」とした場合に無限ループになる。
				jQuery.showalert({
					"type" : "prompt" , 
					"title" : "名前を入力してください。",
					"value" : Player.getInstance().name , 
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
				Player.getInstance().name = name;
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
