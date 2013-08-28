
var MyMap = Class.create(enchant.extendMap.ExMap, {
	"checkTile" : function(x,y,n) {
		var n = n || 0;
		if (x < 0 || this.width <= x || y < 0 || this.height <= y || !this._data[n]) {
			return false;
		}
		var width = this._image.width;
		var height = this._image.height;
		var tileWidth = this._tileWidth || width;
		var tileHeight = this._tileHeight || height;
		x = x / tileWidth | 0;
		y = y / tileHeight | 0;
		//      return this._data[y][x];
		var data = this._data[n];
		return data[y][x];
	} ,
	"isSea" : function(x,y) {
		//var i = this.checkTile(x,y);
		//if (i == 39) 
		//	return true;
		if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
			return false;
		}
		var width = this._image.width;
		var height = this._image.height;
		var tileWidth = this._tileWidth || width;
		var tileHeight = this._tileHeight || height;
		x = x / tileWidth | 0;
		y = y / tileHeight | 0;
		if (this.seaData && this.seaData[y] && this.seaData[y][x])	
			return true;
		return false;
	},
	"investigate" : function(player, x,y) {
		if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
			return false;
		}
		var width = this._image.width;
		var height = this._image.height;
		var tileWidth = this._tileWidth || width;
		var tileHeight = this._tileHeight || height;
		x = x / tileWidth | 0;
		y = y / tileHeight | 0;
		console.log(x,y);

		for (var i=this.events.length-1; i>=0; i--) {
			var data = this.events[i];
			if (!data.ignored && x == data.pos[0] && y == data.pos[1]) {
				var dialog = null;
				if (data.message) {
					console.log(data.message);
					dialog = new DialogScene(game, {"message" : data.message ,"name" : player.name } );
				} else if (data.pickup) {
					this.events[i].ignored = true;
					
					dialog = new DialogScene(game, {"message" : data.pickup, "name" : player.name });
					this._data[1][y][x] = -1;
					this.collisionData[y][x] = 0;
				}
				if (dialog)
					dialog.show();
				return true;
			}
		}
		/**
		var type0 = this.checkTile(x,y);
		var type1 = this.checkTile(x,y,1);
		console.log(x,y);	
		switch(type1) {
			case 352 : console.log('この先、東京'); return true; break;
			// case 107 : console.log('10円を見つけた'); return true; break;	
		} */
		return false;
	},
	"createForegroundMap" : function() {
//		var map = new enchant.extendMap.ExMap(16,16);
		var map = new Map(16,16);
		map.image = this.image;
		map.loadData(configs.map.field.foreground);
		return map;
	} , 	
	"initialize" : function() {
		enchant.extendMap.ExMap.call(this, 16, 16);
		this.image = game.assets['map0.gif'];
		this.loadData.apply(this, configs.map.field.map );
		this.collisionData = configs.map.field.collision;	
		this.seaData = configs.map.field.seamap;
		this.events = configs.map.field.events;
	} // initialize 
}); // Class.create

