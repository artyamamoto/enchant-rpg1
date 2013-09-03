
var RPGMap = RPGMap || {};
RPGMap.Character = Class.create(Sprite, {
	"initialize" : function(map,x,y) {
		Sprite.call(this, 32,32);
		this.x = x * 16 - 8;
		this.y = y * 16;
		
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
			if (! this.visible) 
				return ;
			
			this.frame = this.dir * 3 + this.walk;
			return;

			if (this.isMoving) {
				this._move();
			} else {
				this.vx = this.vy = 0;
				var dir = 0;
				if (game.input.left) {
					this.dir = dir = 1;
					this.vx = -4;
				} else if (game.input.right) {
					this.dir = dir = 2;
					this.vx = 4;
				} else if (game.input.up) {
					this.dir = dir = 3;
					this.vy = -4;
				} else if (game.input.down) {
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
							if (! this.map.hitTest(x, y)) {
								//=== 海はだめ
								if (! this.map.isSea(x,y)) {
									this.isMoving = true;
									this._move();
									event_flg = "move";
								}
							} else {
								//=== 進行方向にボタンを押し続けている場合
								//=== その進行方向の先を調べようとしている
								if (this.dir == dir) {
									this._try_investigate = this._try_investigate ? this._try_investigate + 1 : 1;
									event_flg = "investigate";
									if (this._try_investigate > 6) {
										this.map.investigate(x,y);
									}
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
	} 
});
