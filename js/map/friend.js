
var RPGMap = RPGMap || {};
RPGMap.Friend = Class.create(Sprite, {
	"_animate" : function(dir,walk) {
		this.frame = dir * 3 + walk;
	},
	"_createSurface" : function() {
		var surface = new Surface(96, 128);
		surface.draw(game.assets['chara0.gif'], 0,0,96,128,0,0,96,128);
		this.image = surface;
	},
	"initialize" : function(map,x,y,message) {
		Sprite.call(this, 32,32);
		this.x = x * 16 - 8;
		this.y = y * 16;
		this._createSurface();
		
		this.map = map;
		this.map.attr(this.x + 16,this.y + 16,'player',this);
			
		this.message = message;
		
		this._timing = rand(0,15);		
		this._stop = false;
		this._dir = 0;		// web socket から更新する
			
		this.isMoving = false;
		this.dir = 0;
		this.walk = 1;
		this.vx = 0;
		this.vy = 0;
		this.addEventListener('enterframe', function() {
			if (! this.visible) 
				return ;
			
			this._animate(this.dir, this.walk);

			if (this.isMoving) {
				this._move();
				this._dir = 0;
			} else if (game.frame % 16 == this._timing && !this._stop) {
				var r = rand(1,4);
				
				this.vx = this.vy = 0;
				var dir = 0;
				if (this._dir == 1) {
					this.dir = dir = 1;
					this.vx = -4;
				} else if (this._dir == 2) {
					this.dir = dir = 2;
					this.vx = 4;
				} else if (this._dir == 3) {
					this.dir = dir = 3;
					this.vy = -4;
				} else if (this._dir == 4) {
					this.dir = dir = 4;
					this.vy = 4;
				}
				// 移動開始	
				var event_flg = null;
				if (this.vx || this.vy) {
					var x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
					var y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 16;
					if (0 <= x && x < this.map.width) {
						if (0 <= y && y < this.map.height) {
							if (! this.map.hitTest(x, y,this)) {
								//=== 海はだめ
								if (! this.map.isSea(x,y)) {
									this.isMoving = true;
									this.map.attr(this.x + 16, this.y + 16,'player', false);
									this.map.attr(x,y,'player',this);
									this._move();
									event_flg = "move";
								}
							}
						}
					}
				} 
			}
		});
	} ,
	"_move" : function() {
		this.moveBy(this.vx, this.vy);		
		if (game.frame % 3 == 0) {
			this.walk = (this.walk + 1) % 3;
		}
		if ((this.vx && (this.x - 8) % 16 == 0) || 
			(this.vy && (this.y) % 16 == 0))
		{
			this.isMoving = false;
			this.walk = 1;
		}
	} ,
	"talked" : function(person) {
		if (person) {
			this._stop = true;
			var pos = this.map._pos(this.x + 16,this.y + 16);
			var pos2 = this.map._pos(person.x + 16, person.y + 16);
			if (pos.x > pos2.x) 
				this.dir = 1;
			else if (pos.x < pos2.x) 
				this.dir = 2;
			else if (pos.y > pos2.y)
				this.dir = 3;
			else if (pos.y < pos2.y) 
				this.dir = 4;
			this._animate(this.dir, 1);
		} else {
			this._stop = false;
		}
	}  
});





