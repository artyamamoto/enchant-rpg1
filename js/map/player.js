
var RPGMap = RPGMap || {};
RPGMap.Player = Class.create(Sprite, {
	"initialize" : function(map,x,y) {
		Sprite.call(this, 32,32);
		this.x = x * 16 - 8;
		this.y = y * 16;
		
		this.map = map;
		this.map.attr(this.x + 16,this.y + 16,'player',this);
			
		var surface = new Surface(96, 128);	
		surface.draw(game.assets['chara0.gif'], 0,0,96,128,0,0,96,128);
		this.image = surface;
		
		this.isMoving = false;
		this.dir = 0;
		this.walk = 1;
		this.vx = 0;
		this.vy = 0;
		this._touched = false;
		this._touched_cnt = 0;
		
		this._stop = false;
		
		this.addEventListener('touchstart' , function() {
			this._touched = true;
		});
		this.addEventListener('touchend' , function() {
			this._touched = false;
		});

		this.addEventListener('enterframe', function() {
//			if (! this.visible) 
//				return ;
			
			if (this._touched) 
				this._touched_cnt++;
			else 
				this._touched_cnt = 0;
				
			this.frame = this.dir * 3 + this.walk;
			if (this.isMoving) {
				this._move();
			} else {//if (! this._stop) {
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
							if (! this.map.hitTest(x, y,this)) {
								//=== 海はだめ
								if (! this.map.isSea(x,y)) {
									this.isMoving = true;
									socket.emit('player move' ,Player.getInstance(), this.x+16, this.y+16,x,y,this.dir);
									
									this.map.attr(this.x + 16, this.y + 16,'player', false);
									this.map.attr(x,y,'player',this);
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
										this.map.investigate(x,y,this);
									}
								}
							}
						}
					}
				} 
				if (event_flg != "investigate") {
					this._try_investigate = 0;
				} 
				if (! event_flg) {
					if (this._touched_cnt > 6) {
						this.map.investigate(this.x + 16, this.y + 16, this,true);
						this._touched_cnt = 0;
						this._touched = false;
					}
				}
			}
		});
	} ,
	"_move" : function() {
		 this.moveBy(this.vx, this.vy);	
		//this.x += this.vx;
		//this.y += this.vy;	
		if (game.frame % 3 == 0) {
			this.walk = (this.walk + 1) % 3;
		}
		if ((this.vx && (this.x - 8) % 16 == 0) || 
			(this.vy && (this.y) % 16 == 0))
		{
			this.isMoving = false;
			this.walk = 1;
			/*
			if (rand(5) < 5) {
				new SwitchScreenScene( game, function() {
					new FightScene(game, configs.scenes.map).replaceScene();
				});
			} */
			var _map = this.map.attr(this.x + 16 , this.y + 16 , "map");
			if (_map) {
				if (_map == 'pop')
					MapScene.popScene();
				else
					MapScene.pushScene(_map);
			}
		}
	} , 
	"talkto" : function(person) {
		// this._stop = true;
		person.talked(this);
		
		var name = Player.getInstance().name;
		var dialog = new DialogScene(game, {"message" : person.message, "name" : name });
		dialog.oncomplete = function() {
			// console.log('oncomplete');
			// this._stop = false;	
			person.talked(null);
		};
		dialog.show();
	} /* ,
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
						hit = this.map.investigate( x,y,);
					}
				}
			}
			if (! hit) {
				this._lock_investigate = true;
				hit = this.map.investigate(this.x + 8, this.y + 8);
			}
		}
	} */
});
