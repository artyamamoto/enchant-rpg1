
var Player = Class.create(Sprite, {
	"name" : "遊び人",
	
	"initialize" : function(map) {
		Sprite.call(this, 32,32);
		this.x = 24 * 16 - 8;
		this.y = 18 * 16;
		
		this.map = map;
		
		var surface = new Surface(96, 128);	
		surface.draw(game.assets['chara0.gif'], 0,0,96,128,0,0,96,128);
		this.image = surface;
		
		this.isMoving = false;
		this.dir = 0;
		this.walk = 1;
		this.vx = 0;
		this.vy = 0;
		this.addEventListener('enterframe', function() {
			
			this.frame = this.dir * 3 + this.walk;
			if (this.isMoving) {
				this.moveBy(this.vx, this.vy);		
				if (game.frame % 3 == 0) {
					this.walk = (this.walk + 1) % 3;
				}
				if ((this.vx && (this.x - 8) % 16 == 0) || 
					(this.vy && (this.y) % 16 == 0))
				{
					this.isMoving = false;
					this.walk = 1;
					
					//console.log(map.checkTile(this.x,this.y));
				}
			} else {
				this.vx = this.vy = 0;
				if (game.input.left) {
					this.dir = 1;
					this.vx = -4;
				} else if (game.input.right) {
					this.dir = 2;
					this.vx = 4;
				} else if (game.input.up) {
					this.dir = 3;
					this.vy = -4;
				} else if (game.input.down) {
					this.dir = 4;
					this.vy = 4;
				}
				if (this.vx || this.vy) {
					var x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
					var y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 16;
					if (0 <= x && x < this.map.width) {
						if (0 <= y && y < this.map.height) {
							if (! this.map.hitTest(x, y)) {
								//=== 海はだめ
								if (! this.map.isSea(x,y)) {
									this.isMoving = true;
									arguments.callee.call(this);
								}
							}
						}
					}
				} 
				if (game.input.a && ! this._lock_investigate) {
					this.investigate();
				} else {
					if (! game.input.a)
						this._lock_investigate = false;
				}
			}
		});
	} , 
	"investigate" : function() {
		if (! this.vx && ! this.vy) {
			var x = this.x;
			var y = this.y;
			switch(this.dir) {
				case 1 : x = x - 16; break;
				case 2 : x = x + 16; break;
				case 3 : y = y - 16; break;
				case 4 : y = y + 16; break;
			}
			x += 16; y += 16;
			var hit = false;
			if (0 <= x && x < this.map.width) {
				if (0 <= y && y < this.map.height) {
					if (! this.map.isSea(x, y)) {
						//var i = map.checkTile(x,y);
						//console.log(x,y,i);	
						this._lock_investigate = true;
						hit = this.map.investigate(this, x,y);
					}
				}
			}
			if (! hit) {
				this._lock_investigate = true;
				hit = this.map.investigate(this, this.x + 8, this.y + 8);
			}
		}
	}
});
