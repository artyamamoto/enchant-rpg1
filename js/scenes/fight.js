
var __i = 0;
var FIGHTMODE_START = (1 << (++__i)); // 戦闘開始
var FIGHTMODE_MENU  = (1 << (++__i)); // 戦闘メニュー
var FIGHTMODE_TURN  = (1 << (++__i)); // ターン

var FightScene = Class.create(Scene, {
	"initialize" : function(game) {
		Scene.call(this);
		
		this.game = game;	
		this.backgroundColor  = 'rgba(0,0,0,1)';
		
		this.enemies = [];	
		this._enemies = new Group();	
		this.addChild(this._enemies);
		
		this._initFrame();
		this._initLabel();
		
		// pad 
		this.pad = new Pad();
		this.pad.x = 220;
		this.pad.y = 220;
		this.addChild(this.pad);
		
		this.player = Player.getInstance();
		this.queue = [];
		
		this.addEventListener("touchstart" , function() {
			this._touched = true;
		});
		this.addEventListener("touchend" , function() {
			this._touched = false;
			this._ontouchend();
		});
	} ,
	"start" : function(options) {
		this._options = options;
	
		this._fps_org = this.game.fps;
		this.game.fps = 48;
			
		this.initFight();
		this._checkFrameColor();
		this.game.pushScene(this);
	} , 
	"end" : function() {
		this.game.fps = this._fps_org;
		this.game.popScene();
		if (this._options && this._options.end) {
			this._options.end.call(this);
		}
	},
	"_initTurn" : function() {
		var self = this;
		
		var people = [];
		this.players.forEach(function(p) {
			p.type = 'player';
			p.__hp = p.hp;
			p.__mp = p.mp;
			people.push(p);
		});
		this.enemies.forEach(function(p) {
			p.type = 'enemy';
			p.__hp = p.hp;
			people.push(p);
		});
		people.shuffle();

		this.queue = [];
		var ignore = false;
		people.forEach(function(p) {
			if (p.__hp <= 0)
				return ;	//死んだらとばす
			if (ignore) 
				return;
			if (p.type == 'player') {
				var enemy = this.enemies[0];
				switch(p.action) {
					case 'attack' :
						var damage = rand(1,100);
						this.queue.push({"message" : "{0}のこうげき！".format(p.name)});	
						this.queue.push({"shake" : [enemy._sp] });
						this.queue.push({"message" : "{0}に{1}のダメージ！".format(enemy.name, damage),
										"append" : true});
						this.queue.push({"callback" : function() {
											enemy.hp = Math.max(0, enemy.hp - damage);
											console.log('enemy {0}:{1}'.format(enemy.name,enemy.hp));
										}});
						enemy.__hp -= damage;
						if (enemy.__hp <= 0 ) {
							this.queue.push({"message" : "{0}をやっつけた。".format(enemy.name),"append":true});	
							this.queue.push({"callback" : function() {
												enemy._sp.visible = false; 
											}});
						}
					break;
					case 'magic' :
						this.queue.push({"message" : "{0}はパルプンテをとなえた！".format(p.name)});
						if (p.__mp > 0) {
							var t = rand(1,100);
							this.queue.push({"message" : "しかしなにもおこらなかった。","append":true});
							this.queue.push({"callback" : function() {
												p.mp = Math.max(0, p.mp - t);
											}});
							p.__mp = Math.max(0, p.__mp - t);
						} else {
							this.queue.push({"message" : "しかしMPがたりない！","append":true});
						}
					break;
					case 'item':
						this.queue.push({"message" : "{0}はせいすいをふりかけた。".format(p.name)});
						this.queue.push({"message" : "しかしこうかがなかった。","append":true});
					break;
					case 'defence' :
						this.queue.push({"message" : "{0}はみをまもっている。".format(p.name) });
					break;
					default :
						console.log('unknown command:' + p.action); 
					break;
				}
				if (enemy.__hp <= 0) {
					this.queue.push({"message" : "てきをやっつけた。"});
					this.queue.push({ "callback" : function() {
										self.end();
									}});
					ignore = true;
					return false;
				}
			} else {
				/*
				var player = null;
				var i = 0;
				do {
					var player = this.players[rand(0,this.players.length - 1)];
				} while(! player.__hp && i++ < 100);
				*/
				//=== 生きているやつ
				var alive = [];
				for (var i=this.players.length - 1; i >=0 ;i--) 
					if (this.players[i].__hp > 0) 
						alive.push(this.players[i]);
				if (alive.length <= 0)
					return;
				var player = alive[rand(0,alive.length-1)];
				
				var r = rand(0,3);
				switch(r) {
					case 1:
						this.queue.push({"message" : "{0}はふしぎなおどりをおどった！".format(p.name)});
						this.queue.push({"message" : "しかしこうかがなかった！", "append" : true});
					break;
					default:
						var damage = rand(1,100);
						this.queue.push({"message" : "{0}のこうげき！".format(p.name)}); 
						this.queue.push({"shake" : [this.frame1,this.frame2,this.frame3,this.frame4,this.labels,this.messageLabel]});
						this.queue.push({"message" : "{0}に{1}のダメージ！".format(player.name,damage),
										"append" : true});
						this.queue.push({"callback" : function() {
												player.hp = Math.max(0, player.hp - damage);
											}});
						player.__hp -= damage;
						if (player.__hp <= 0) {
							this.queue.push({"message" : "{0}はしんでしまった！".format(player.name) , 
											"append" : true });
							var alive = false;
							for (var i = 0; i < this.players.length; i++) {
								if (this.players[i].__hp > 0) 
									alive = true;
							}
							if (alive == false) {
								this.queue.push({"message" : "{0}たちはしんでしまった。".format(this.player.name)});
								this.queue.push({"callback" : function() {
																	self.end();
															}});
							}
						}
					break;
				}
			}
		}.bind(this));
		
		this.processQueue();
	},
	"initFight" : function() {
		this.initEnemies([
			{'img' : 'pisaro.jpg' , 'name' : 'デスピサロ', 'hp' : 1000}
		]);	
			
		this.queue = [
			{"message" : 'デスピサロがあらわれた！'} , 
			//{"message" : 'デスピサロがあらわれた！',"append" : true} , 
			//{"message" : 'デスピサロがあらわれた！','append' : true}
		];
		this.processQueue();
		this.mode = FIGHTMODE_START;	// 0=戦等開始
		this.menuCurrentMenu = 0;	// メニュー
		this.menuCurrentPlayer = 0;
	},
	"initEnemies" : function(datas) {
		this.enemies = [];
		for (var i=this._enemies.childNodes.length-1; i>=0; i--) {
			var o = this._enemies.childNodes[i];
			this._enemies.removeChild(o);
		}
		for(var i=0; i<datas.length;i++) {
			var data = datas[i];
			
			var top = this.frame1.y + this.frame1.height;
			var bottom = this.frame4.y;
			var left = this.frame4.x;
			var right = this.frame4.x + this.frame4.width;
			var maxwidth = right - left;
			var maxheight = bottom - top;
			
			var enemy = data;
			enemy._img = img = game.assets[data.img];
			
			var width = img.width,  
				height = img.height;
			if (width > maxwidth) {
				var r = maxwidth / width;
				width *= r; height *= r;
			}
			if (height > maxheight) {
				var r = maxheight / height;
				width *= r; height *= r;
			}
			width = intval(width);
			height = intval(height);
			
			enemy._sf = sf = new Surface(width, height);
			sf.draw(img, 0,0, img.width, img.height,0,0,width,height);
			
			enemy._sp = sp = new Sprite(width, height);
			sp.image = sf;
			sp.x = left + (maxwidth - width) / 2;
			sp.y = top + (maxheight - height) / 2;
			
			this.enemies.push(enemy);
			this._enemies.addChild(sp);
		}
	},
	"_updateLabel" : function() {
		var self = this;
		
		var i = -1;
		[this.player.name,'アリーナ','クリフト','ブライ'].forEach(function(namestr) {
			i++;
			var player = self.players[i];
			player.name = namestr;
			
			player._name.text = player.name;
			player._name._bg.width = player._name._boundWidth + 4;
			player._name._bg.height = player._name._boundHeight + 4;
			
			
			["hp","mp","lv"].forEach(function(k) {
				var k0 = "_" + k;
				player[k0].text = player[k];
				player[k0].x = player.right - player[k0]._boundWidth;
			});
		});	
		/* this.name.text = configs.player.name;
		this.name._bg.width = (this.name._boundWidth + 4);
		this.name._bg.height = this.name._boundHeight + 4; */
	},
	"_label" : function(str,x,y) {
		var getLabel = DialogUtil.getLabel;
		var color = '#ffffff';
		if (this.frameColor) {
			color = color16.apply(null, this.frameColor);
		}
		
		// name 
		var label1 = getLabel.call(null, str,color);		
		label1.x = x;
		label1.y = y;
		//this.addChild(label1);
		return label1;
	},
	"_blackbg" : function(x,y,width,height) {
		if (arguments.length == 1) {
			var obj = arguments[0];
			x = obj.x;
			y = obj.y;
			height = obj.height;
			width = obj.width;
		}
		var bg = new Sprite( width, height );
		var sf = new Surface( width , height); 
			sf.context.fillStyle = 'rgba(0,0,0,1)';
			sf.context.fillRect(0,0,width,height);
		
		bg.image = sf;
		bg.x = x;
		bg.y = y;
		return bg;
	},
	"_arrow" : function(width,height,dir) {
		dir = dir || "right";
		
		var sf = new Surface(width,height);
		sf.context.fillStyle = vsprintf('rgba({0},{1},{2},1)', this.frameColor);
		var pathes = [];
		switch(dir) {
			case "right" :
				pathes.push([0,0]);
				pathes.push([width,intval(height/2)]);
				pathes.push([0,height]);
			break;
			case "under":
				pathes.push([0,0]);
				pathes.push([width,0]);
				pathes.push([intval(width/2), height]);
			break;
		}
		sf.context.beginPath();
		for(var i=0; i<pathes.length; i++) {
			if (i == 0)
				sf.context.moveTo.apply(sf.context, pathes[i]);
			else 
				sf.context.lineTo.apply(sf.context, pathes[i]);
		}
		sf.context.closePath();
		sf.context.fill();

		var sp = new Sprite(width,height);
		sp.image = sf;
		return sp;
	},
	"_hideMenu" : function() {
		if (this.menulabels) {
			this.removeChild(this.menulabels);
			this.menulabels = null;
		}
		if (this.menuarrow) {
			this.removeChild(this.menuarrow);
			this.menuarrow = null;
		}	
	}, 
	"_initMenu" : function(initCurrentPlayer) {
		if (this.menulabels) {
			this.removeChild(this.menulabels);
		}
		this.menulabels = new Group();
		this.addChild(this.menulabels);
		if (initCurrentPlayer){ 
			this.menuCurrentPlayer = 0;
		}
		this.menuCurrentMenu = 0;
		
		var self = this;
		var name = self.players[self.menuCurrentPlayer].name;
		
		var y = self.frame4.y + 10;
		var i = -1;
		[name, 'こうげき','じゅもん','ぼうぎょ','どうぐ'].forEach(function(menustr) {
			++i;
			
			var left = self.frame1.x + 10;
			var label = self._label(menustr, left + 12 , 0);
			label.y = y + (label._boundHeight * 1.6) * (i - 0.7);
			
			if (i == 0) {
				label.x -= 12;
				var bg = self._blackbg( label.x - 4, label.y, label._boundWidth + 8, label._boundHeight );
				self.menulabels.addChild(bg);
			}
			self.menulabels.addChild(label);
			if (i >= 1) {
				label._idx = (i - 1);
				label.addEventListener('touchend' , function() {
					self.menuCurrentMenu = this._idx;
					self._onkeyup({"right":true});
				});
			}
		});
		if (self.menuarrow) {
			self.removeChild(self.menuarrow);
			self.menuarrow = null;
		}
		self.menuarrow = self._arrow(8,8,'right');
		self.addChild(self.menuarrow);
		
		self.menuarrow.x = self.frame1.x + 10;
		
		var label = self.menulabels.childNodes[self.menuCurrentMenu + 2];
		self.menuarrow.y = label.y + (label._boundHeight  - self.menuarrow.width) / 2;
	},
	"_initLabel" : function() {
		if (this.labels) {
			this.removeChild(this.labels);
		}
		this.labels = new Group();
		this.addChild(this.labels);
		
			
		this.players = [];
		
		var left = this.frame1.x + 10;
		var width = this.frame1.width - 20;
		
		var getLabel = DialogUtil.getLabel;
		// name
		
		var self = this;
		var i = -1;
		['-','アリーナ','クリフト','ブライ'].forEach(function(namestr) {
			i++;
			var player = {};
			
			var x = left + intval(width / 4 * i);
			var right = left + intval(width / 4 * (i + 1)) - 24;
			var name = self._label(namestr, x, 0);
			name.y = self.frame1.y - (name._boundHeight / 2) + 2;
			
			name._bg = self._blackbg( name.x - 2 , name.y ,
								Math.max(intval(width/4 - 8), name._boundWidth) , 
								Math.max(18, name._boundHeight));
			self.labels.addChild(name._bg);
			self.labels.addChild(name);
			player._name = name;
			player.name = namestr;
			player.hp = rand(20,300);
			player.maxhp = player.hp;
			player.mp = ((namestr == 'アリーナ') ? 0 : rand(0,100));
			player.maxmp = player.mp;
			player.lv = rand(1,99);
			player.left = left;
			player.right = right;
			
				
			var y = name.y;
			var titles = {"hp" : "H", "mp": "M" , "lv" : "Lv:"};
			array_keys(titles).forEach(function(k) {
				var str = titles[k];
				
				var label = self._label(str, x , 0);
				label.y = y = y + (label._boundHeight * 1.6);
				self.labels.addChild(label);
				
				var st = self._label(player[k], 0, label.y);
				st.x = right - st._boundWidth ;
				player["_" + k] = st;
				self.labels.addChild(st);
				// player.status
			});
			
			if (i == 0) {
				self.name = name;
			}
			self.players.push(player);
		});
	} , 
	"_initFrame" : function() {
		/*
		['frame1','frame2','frame3','frame4'].forEach(function(k) {
			if (this[k]) {
				
			}
		}) */
		
		// サイズ計算
		var padding = 8;
		var width = game.width - padding * 2;
		var height = game.height - padding * 2;
		
		var getLabelBg = DialogUtil.getLabelBg;
		
		var frame1 = getLabelBg.call(null,null, width , intval(height / 3));
		frame1.x = padding;
		frame1.y = padding;
		
		var frame2 = getLabelBg.call(null,null, 
									intval(width / 3 - padding / 2) , intval(height / 3));
		frame2.x = padding;
		frame2.y = game.height - padding - frame2.height;
		
		var frame3 = getLabelBg.call(null,null, 
									intval(width / 3 * 2 - padding / 2) , intval(height / 3));
		frame3.x = frame2.x + frame2.width + padding;
		frame3.y = frame2.y;
		
		var frame4 = getLabelBg.call(null,null, intval(frame2.width + padding + frame3.width) , intval(height/3));
		frame4.x = frame2.x;
		frame4.y = frame2.y;
			
		this.addChild(frame1);
		this.addChild(frame2);
		this.addChild(frame3);
		this.addChild(frame4);
		
		this.frame1 = frame1;
		this.frame2 = frame2;
		this.frame3 = frame3;
		this.frame4 = frame4;
		
		this.messageLabel = this._label('　　　', this.frame4.x + 8 , this.frame4.y + 8);		
		this.addChild(this.messageLabel);
	},
	"_checkFrameColor" : function() {
		this.frameColor = [255,255,255];
		
		var status = 1;
		var that = this;
		this.players.forEach(function(player) {
			if (status < 2 && player.maxhp * 0.2 > player.hp) {
				that.frameColor = [127,255,127];
				status = 2;
			} 
			if (status < 3 && player.hp <= 0) {
				that.frameColor = [255,127,127];
				status = 1;
			}
		});
		
		var color = vsprintf('rgba({0},{1},{2},1)', this.frameColor);
		DialogUtil.redrawLabelBg(this.frame1 , color);
		DialogUtil.redrawLabelBg(this.frame2 , color);
		DialogUtil.redrawLabelBg(this.frame3 , color);
		DialogUtil.redrawLabelBg(this.frame4 , color);
		
		var color = color16.apply(null,this.frameColor);
		this.messageLabel.color = color;
		//console.log('this._checkFrameColor');
		for (var i=this.labels.childNodes.length - 1; i >=0; i--) {
			this.labels.childNodes[i].color = color;
		}
	},
	"onenterframe" : function() {
		this._updateLabel();
		
		// message
		if (this.message) {
			this.frame4.visible = true;
			this.messageLabel.visible = true;
			this.messageLabel.text = this.message;
		} else {
			this.frame4.visible = false;
			this.messageLabel.visible = false;
		}
		// shake_c
		if (this.shake_c) {
			if (this.shaked) {
				var self = this;
				this.shaked.forEach(function(p) {
					if (!p.x_org) p.x_org = p.x;
					if (!p.y_org) p.y_org = p.y;
					p.x = p.x_org + 2.97 * (Math.cos(Math.PI * self.shake_c / 4.21 + 1.11 ));
					p.y = p.y_org + 3.37 * (Math.cos(Math.PI * self.shake_c / 3.11 + 1.11));
				});
			}
			this.shake_c--;
		} else {
			if (this.shaked) {
				this.shaked.forEach(function(p) {
					if (p.x_org) p.x = p.x_org;
					if (p.y_org) p.y = p.y_org;
					p.x_org = p.y_org = 0;
				});	
				this.shaked = null;
			}
		}
		
		//=== key
		var self = this;
		if (game.input.up || game.input.down || game.input.left || game.input.right) {	
			this.__keydown = true;
			["up","down",'left','right'].forEach(function(k) {
				if (game.input[k]) {
					this.__lastinput = k;
				}
				// return false;
			}.bind(this));
		} else {
			if (this.__keydown && this.__lastinput) {
				// keyup 
				var input = {};
				input[this.__lastinput]  = true;
				this._onkeyup(input);
			}
			this.__keydown = false;
			this.__lastinput = null;
		}
	},
	"_onkeyup" : function(input) {
		input = input || {};
		if (this.mode == FIGHTMODE_MENU) {
			if (input.up || input.down) {
				var idx = this.menuCurrentMenu;
				var len = this.menulabels.childNodes.length - 2;
				if (input.up) {
					idx--;
				} else if (input.down) {
					idx++;
				}
				this.menuCurrentMenu = (idx + len) % len;
				
				var label = this.menulabels.childNodes[this.menuCurrentMenu + 2];
				this.menuarrow.y = label.y + (label._boundHeight  - this.menuarrow.width) / 2;
			}
			if (input.right) {
				var idx = this.menuCurrentMenu;
				var label = this.menulabels.childNodes[this.menuCurrentMenu + 2];
				if (label.text.indexOf('こうげき') >= 0) {
					this.players[this.menuCurrentPlayer].action = 'attack';
				} else if (label.text.indexOf('じゅもん') >= 0 ) {
					this.players[this.menuCurrentPlayer].action = 'magic';
				} else if (label.text.indexOf('ぼうぎょ') >= 0) {
					this.players[this.menuCurrentPlayer].action = 'defence';
				} else if (label.text.indexOf('どうぐ') >= 0) {
					this.players[this.menuCurrentPlayer].action = 'item';
				}
				var nextmenu = false;
				while(this.menuCurrentPlayer + 1 < this.players.length) {
					this.menuCurrentPlayer ++;
					var player = this.players[this.menuCurrentPlayer];
					if (player.hp > 0) {
						nextmenu = true;
						break;
					}
				}
				
				if (nextmenu) {
					this._initMenu(false);
				} else {
					this._hideMenu();
					
					this.menuCurrentPlayer = 0;
					this.mode = FIGHTMODE_TURN;
					this._initTurn();
				}
			}
		}
	} ,
	"_ontouchend" : function() {
		if (this.processQueue())
			return;
		switch(this.mode) {
			case FIGHTMODE_START : // 戦闘開始; 戦闘メニューへ
				this.mode = FIGHTMODE_MENU;	
				this.message = null; 
				this._initMenu(true);
			break;
			case FIGHTMODE_MENU:	// 戦闘メニュー
			break;
			case FIGHTMODE_TURN:	// ターンが続いている間はキューの処理なのでここにきた時点でメニューへ
				this.mode = FIGHTMODE_MENU;	
				this.message = null; 
				this._initMenu(true);
				
				var idx = -1;
				while(idx + 1 < this.players.length) {
					idx++;
					var player = this.players[idx];
					if (player.hp > 0) {
						this.menuCurrentPlayer = idx;;
						break;
					}
				}
			break;
		}
	} , 
	"processQueue" : function() {
		if (this.shake_c) 
			return true; // 何もしない
		
		if(this.queue.length > 0) {
			var next = this.queue.shift();
			if (next && next.callback) {
				next.callback.call();
				next = this.queue.shift();
			}
			
			if (next) {
				if (typeof next == 'string') {
					this.message = next;
				} else if (next.message) {
					if (next.append) 
						this.message += "\n<br />" + next.message;
					else
						this.message = next.message;
				} else if (next.shake) {
					if (next.shake !== true) {
						this.shaked = next.shake;
						this.shake_c = 24;
					}
				}
				//=== キューの処理後の処理
				this._checkFrameColor();
			} else {
				this.message = null;
				return false;
			}
			return true;
		}
		return false;
	} 
});
