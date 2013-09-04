
var RPGMap = RPGMap || {};

RPGMap.Map = Class.create(enchant.extendMap.ExMap, {
	"_pos" : function(x,y) {
		if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
			return false;
		}
		var width = this._image.width;
		var height = this._image.height;
		var tileWidth = this._tileWidth || width;
		var tileHeight = this._tileHeight || height;
		x = x / tileWidth | 0;
		y = y / tileHeight | 0;
		return {"x":x,"y":y};
	},
	"attr" : function(x,y,k,v) {
		var pos = this._pos(x,y);
		if (! pos)
			return false;
		x = pos.x; y = pos.y;
		
		if (v == undefined) {
			if (this._attrs[y] && 
				this._attrs[y][x] && 
				this._attrs[y][x][k])
			{
				return this._attrs[y][x][k];
			}
			return undefined;
		} else {
			if (! this._attrs[y])
				this._attrs[y] = {};
			if (! this._attrs[y][x])
				this._attrs[y][x] = {};
			this._attrs[y][x][k] = v;
		}
	},
	"hitTest" : function(x,y,player) {
		var ret = enchant.extendMap.ExMap.prototype.hitTest.call(this,x,y);
		if (ret === true)
			return ret;
		
		if (player) {
			var p = this.attr(x,y,"player");
			if (p && p !== player)  
				return true;
		}
		return false;
	}, 
	"checkTile" : function(x,y,n) {
		var n = n || 0;
		
		var pos = this._pos(x,y);
		if (! pos)
			return false;
		x = pos.x; y = pos.y;
		
		var data = this._data[n];
		return data[y][x];
	} ,
	"isSea" : function(x,y) {
		//var i = this.checkTile(x,y);
		//if (i == 39) 
		//	return true;
		var pos = this._pos(x,y);
		if (! pos)
			return false;
		x = pos.x; y = pos.y;

		if (this.seaData && this.seaData[y] && this.seaData[y][x])	
			return true;
		return false;
	},
	"investigate" : function(x,y,player, is_foot) {
		var name = Player.getInstance().name;
		
		// player 
		if (player && ! is_foot) { 
			var p = this.attr(x,y,"player");
			if (p && p !== player) {
				player.talkto(p);
				return;
			}
		}
		// events
		var events = this.attr(x,y,"events");
		if (events) {
			for (var i=0; i<events.length;i++) {
				var e = events[i];
				if (e.ignored) 
					continue;
				
				//this.dispatchEvent(
				var dialog = null;
				if (e.message) {
					dialog = new DialogScene(game, {"message" : e.message ,"name" : name } );
				} else if (e.pickup) {
					e.ignored = true;
					
					dialog = new DialogScene(game, {"message" : e.pickup, "name" : name });
					this._data[1][e.pos[1]][e.pos[0]] = -1;
					this.collisionData[e.pos[1]][e.pos[0]] = 0;
				} else if (e.map) {
					if (e.map != "pop")
						MapScene.pushScene(e.map);
					else 
						MapScene.popScene(e.map);
				}
				if (dialog)
					dialog.show();
				return true;
			}
		}
		console.log(this._pos(x,y));
		if (is_foot) {
			dialog = new DialogScene(game, {"message" : "%Name%はあしもとをしらべた。\nしかしなにもみつからなかった。", "name" : name });
			dialog.show();
		}	
		return false;


		var pos = this._pos(x,y);
		if (! pos)
			return false;
		x = pos.x; y = pos.y;

		console.log(x,y);	
		// events
		for (var i=this.events.length-1; i>=0; i--) {
			var data = this.events[i];
			if (!data.ignored && x == data.pos[0] && y == data.pos[1]) {
				var dialog = null;
				if (data.message) {
					var name = Player.getInstance().name;
					dialog = new DialogScene(game, {"message" : data.message ,"name" : name } );
				} else if (data.pickup) {
					this.events[i].ignored = true;
					
					var name = Player.getInstance().name;
					dialog = new DialogScene(game, {"message" : data.pickup, "name" : name });
					this._data[1][y][x] = -1;
					this.collisionData[y][x] = 0;
				} else if (data.map) {
					MapScene.pushScene(data.map);
				}
				if (dialog)
					dialog.show();
				return true;
			}
		}
		if (is_foot) {
			dialog = new DialogScene(game, {"message" : "%Name%はあしもとをしらべた。\nしかしなにもみつからなかった。", "name" : name });
			dialog.show();
		}
		return false;
	},
	"createForegroundMap" : function() {
//		var map = new enchant.extendMap.ExMap(16,16);
		var map = new Map(16,16);
		map.image = this.image;
		map.loadData(configs.map[this.type].foreground);
		return map;
	} , 	
	"initialize" : function(type) {
		var type = type || "field";
		this.type = type;

		var data = configs.map[type];
		this._attrs = {};	// 付随情報はここに記録する

		enchant.extendMap.ExMap.call(this, 16, 16);
		this.image = game.assets['map0.gif'];
		this.loadData.apply(this, configs.map[type].map );
		
		this.collisionData = data.collision || [];	
		this.seaData = data.seamap || [[]];
		// this.events = data.events || [];
		if (data.events) {
			for (var i=0; i<data.events.length; i++) {
				var d = data.events[i];
				var x0 = d.pos[0] * 16;
				var y0 = d.pos[1] * 16;
				
				if (d.map) {
					this.attr(x0,y0, "map", d.map);
					continue;
				} else {	
					var events = this.attr(x0, y0, "events");
					if (!events) 
						events = [];
					events.push(d);
					
					this.attr(x0, y0, "events", events);
				}
			}	
		}
		
		
		this.player = new RPGMap.Player(this, data.player[0],data.player[1]);
		
		var _player = Player.getInstance();
		_player.map.type = this.type;
		_player.map.x = data.player[0];
		_player.map.y = data.player[1];
		_player.pos.x = this.player.x;
		_player.pos.y = this.player.y;
		_player.sync();
		
		this.characters = [];
		for (var i=data.characters.length-1; i>=0; i--) {
			var c = data.characters[i];
			var _class = RPGMap[c[2]];
			var _message = c[3];
				
			this.characters.push( new (_class)(this, c[0], c[1], _message) );	
		}
	} // initialize 
}); // Class.create

RPGMap.Map.getInstance = function(type) {
	if (!RPGMap.Map._instances)
		RPGMap.Map._instances = {};
	if (! RPGMap.Map._instances[type])
		RPGMap.Map._instances[type] = new RPGMap.Map(type);
	return RPGMap.Map._instances[type];
};

