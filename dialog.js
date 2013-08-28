


var Dialog = Class.create(Group, {
	"_options" : function(options) {
		options = options || {};	
		/** 
		width , height 
		align - left , right, center
		valign - top , bottom , middle 
		margin
		**/
		options.align = options.align || "left";
		options.valign = options.valign || "bottom";
		options.margin = options.margin || 5;
		options.width = options.width || (game.width - options.margin * 2);
		options.height = options.height || intval((game.height - options.margin) / 2.8);
		
		options.message = options.message || "";
		options.padding = options.padding || 8;
		return options;
	},
	"setMessage" : function(message) {
		this.idx = 0;
		this.messages = [];
		if (message.indexOf("\n") < 0) {
			this.messages.push(message);
		} else {
			this.messages = message.split("\n");
		}	
	},
	"initialize" : function(game, options) {
		Group.call(this);
		
		options = this._options(options);
		
		this.setMessage(options.message);	
		
		this.game = game;
		this.name = options.name || "名無し";
			
		// x, y 
		var x = 0, y = 0;
		switch (options.align) {
			case "left" : x = options.margin; break;
			case "right" : x = game.width - options.width - options.margin; break;
			default : x = intval((game.width - options.width) / 2); break;
		}
		switch (options.valign) {
			case "top" : y = options.margin; break;
			case "middle" : 
			case "center" :
				y = intval((game.height - options.height) / 2);
			default :
				y = game.height - options.height - options.margin;
		}
		
		
		// window frame
		var bg = new Sprite(options.width , options.height);
		var sf = new Surface(options.width, options.height);
		var fill = function(style,x,y) {
			sf.context.fillStyle = style;
			sf.context.fillRect(x,y,options.width-x*2,options.height-y*2);
		};
		fill('rgb(0,0,0)',0,0);
		fill('rgb(255,255,255)',1,1);
		fill('rgb(0,0,0)',2,2);
		bg.image = sf;
		
		// label
		var label = new Label();
		label.font = '12px monospace';
		label.color = 'white';
		label.x = options.padding;
		label.y = options.padding;
		label.width = options.width - options.padding * 2;
		// label.text = options.message;
		this.label = label;
				
		// win group 
		this.x = x;
		this.y = y;
		this.addChild(bg);
		this.addChild(label);
	},
	"next" : function() {
		if (this.messages.length > this.idx) {
			var text = [];
			for (var i=0; i<=this.idx; i++) {
				var s = this.messages[i];
				s = s.split('%Name%').join(this.name);
				text.push(s);
			}
			this.label.text = text.join("<br />");
			this.idx++;
			return true;
		} else {
			return false;
		}
	}
});

// enchant js でcanvas とテキストフィールドを混在させるとうまく動かない。。。
var Prompt = Class.create(Dialog, {
	"initialize" : function(game,scene, options) {
		Dialog.call(this, game, options);
		options = this._options(options);
		console.log(this);
	/*	
		var input = new InputTextBox();
		input.width = options.width - options.padding * 2 - 18;
		input.x = this.x + options.padding + 6;
		input.y = this.y + options.padding + 6;
		input._input.style.border = "1px solid #999";
		input.backgroundColor = "#fff";
		input._input.style.color = "#fff";
		input._input.placeholder = options.placeholder || "hoge";
	*/
		var input = new Label('<form action="#"><input type="text" /></form>');
		scene.addChild(input);
	}
});


