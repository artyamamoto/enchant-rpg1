
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
				console.log("attr [" + x + "," + y + "," + k + "] get" , this._attrs[y][x][k]);
				return this._attrs[y][x][k];
			}
			console.log("attr [" + x + "," + y + "," + k + "] get" , undefined);
			return undefined;
		} else {
			if (! this._attrs[y])
				this._attrs[y] = {};
			if (! this._attrs[y][x])
				this._attrs[y][x] = {};
			this._attrs[y][x][k] = v;
			
			console.log("attr [" + x + "," + y + "," + k + "] set" , this._attrs[y][x][k]);
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
		// player 
		if (player && ! is_foot) { 
			var p = this.attr(x,y,"player");
			if (p && p !== player) {
				player.talkto(p);
				return;
			}
		}
		var pos = this._pos(x,y);
		if (! pos)
			return false;
		x = pos.x; y = pos.y;

		
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
		map.loadData(configs.map.field.foreground);
		return map;
	} , 	
	"initialize" : function(type) {
		var type = type || "field";
		enchant.extendMap.ExMap.call(this, 16, 16);
		this.image = game.assets['map0.gif'];
		this.loadData.apply(this, configs.map[type].map );
		
		this.collisionData = configs.map[type].collision || [];	
		this.seaData = configs.map[type].seamap || [[]];
		this.events = configs.map[type].events || [];
		
		this._attrs = {};	// 付随情報はここに記録する
		
		this.player = new RPGMap.Player(this, 24,18);
		this.characters = [];
		this.characters.push( new RPGMap.Character(this, 24, 17) );	
	} // initialize 
}); // Class.create

RPGMap.Map.getInstance = function(type) {
	if (!RPGMap.Map._instances)
		RPGMap.Map._instances = {};
	if (! RPGMap.Map._instances[type])
		RPGMap.Map._instances[type] = new RPGMap.Map(type);
	return RPGMap.Map._instances[type];
};

