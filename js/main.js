
// enchant();

var game = game || {};
var socket;
var socket_sessid = null;

window.onload = function() {
	try {
		var sock = new io.connect('http://' + location.host + ':3000');
		sock.on('player sync' , function(socket_id, player) {
			console.log('player add : ' + player.name );
			
			var map = MapScene.getScene(player.map.type);
			var friend = new RPGMap.Friend(map.map, player.map.x, player.map.y, 'aaa');
			map.characters.addChild(friend);
		});
		sock.on('map sync' , function(map) {
			configs.map = map;
			start();
		});
		sock.on('connect' , function() {
			socket_sessid = sock.socket.sessionid;
			console.log('接続完了');
			socket = sock;
				
			// game start 
			// start();
		});
		sock.on('connect_failed', function() {
			console.log('接続失敗');
			alert('WebSocket接続に失敗しました。');
		});
	} catch(e) {
		console.log('エラー：' + e);
		alert('WebSocket接続時にエラーが発生しました。');
	}
};

function start() {
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
		var map = MapScene.getScene('field');
		
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
				Player.getInstance().sync();
				map.replaceScene();
			});
		});
	};
/*	async.parallel([
		function(next) {
			jQuery.get( configs.ajax.map.field, {}, function(data) {
				configs.map.field = data;
				next();
			});
		} ,
		function(next) {
			jQuery.get( configs.ajax.map.dungeon, {}, function(data) {
				configs.map.dungeon = data;
				next();
			});
		}
	], function() {
		game.start();
	}); */
	game.start();
	/* jQuery.get( configs.ajax.map.field, {}, function(data) {
		configs.map.field = data;
		game.start();
	} , "json"); */
};
