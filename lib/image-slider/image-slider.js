

jQuery.fn.imageSlider = function(options) {
	var $this = $(this);
	options = $.extend({}, 
						jQuery.fn.imageSlider.default_params , 
						options || {});
	$this.each(function () {
		var $c = $(this);
		var $i = new jQuery.fn.imageSlider.ImageSlider($c, options);
		$c.data("ImageSlider" , $i);
	});
};
jQuery.fn.imageSlider.default_params = {
	"speed" : 850 ,
	"speed-desc" : 500 
//	"easing" : "swing" 
};


jQuery.fn.imageSlider.ImageSlider = function($c, options) {
	var self = this;
	
	self.$ul = null;
	self.$images = null;
	self.$list = null;
	self.$desc = null;
	
	self.idx = 0;
	self._locked = false;
	self._onmouse_flg = false;
	
	var speed = options["speed"];
	var speed_desc = options["speed-desc"];
	
	var htmlescape = /*htmlescape || */function(str, nl2br) {
		str = "" + str;
		str = str.replace(/&/g,'&amp;');
		str = str.replace(/>/g,'&gt;');
		str = str.replace(/</g,'&lt;');
		str = str.replace(/"/g, '&quot;');
		if (nl2br)
			str = str.split("\n").join("<br />\n");
		return str;
	};
	var intval = function (s,base,default_val) {
		default_val = default_val || 0;
		
		var type = typeof(s);
		if (type === 'boolean') {
			return +s;
		} else if (type === 'string') {
			try {
				var tmp = parseInt(s , base || 10);
				return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp;
			} catch(e) {}
			
			return 0;
		} else if (type === 'number' && isFinite(s)) {
			return s | 0;
		} 
		return 0;
	};
	self.slide = function() {
		if (self._locked) 
			return;
		
		var $image = self.$images.eq(self.idx);
		var start = $image.position().top;
		var end = $image.position().top + $image.find("img").height() - $c.outerHeight();
		
		start *= -1;
		end *= -1;
		
		if (start == end) {
			return;
		}
		
		var pos = intval(self.$ul.css("top"));
		if (end <= pos - 1 && pos <= start)
			self.$ul.css("top" , (pos - 1) + "px");
//		console.log(pos,start,end);
	};
	self.move = function(idx) {
		if (self._locked) 
			return;
		self._locked = true;
		
		var len = self.$images.size();
		if (idx == "prev")
			idx = (self.idx + len - 1);
		else if (idx == "next")
			idx = (self.idx + 1);
		idx %= len;
		
		var $start = self.$images.eq(self.idx);
		var $target = self.$images.eq(idx);
		
		var start = $start.position().top;
		var end = $target.position().top;
		
		//console.log("start - " + start);
		//console.log("end - " + end);
		start *= -1;
		end *= -1;
		
		var complete_num = 2;	// 複数の非同期処理がすべて終わったら self._locked = false; とする
		
		var finish_move_animation = function() {
			if (--complete_num > 0) {
				return;
			}
			self._locked = false;
			self.idx = idx;
			self.$list.find("a").css("opacity","0.3");
			self.$list.find("a").eq(self.idx).css("opacity","");
			//self.$list.find("li").eq(self.idx).html('<a href="javascript: void(0);">●</a>');
		};
		
		//=== <ul> animate
		self.$ul
		//	.css("top", start + "px")
			.animate({
				"top" : end + "px" 
			}, speed, options.easing , function() {
				finish_move_animation();
			});
		
		//=== description animate
		self.$desc._lock = true;
		
		self.$desc
			.stop()
			.animate({
				"left" : (-1 * self.$desc.outerWidth()) + "px" 
			}, speed_desc ,"linear", function() {
				var $img = $target.find("img");
				self.$desc.find(".dt").html(htmlescape($img.attr("data-dt"), true));
				self.$desc.find(".category").html(htmlescape($img.attr("data-category"), true));
				self.$desc.find(".title").html(htmlescape($img.attr("data-title"), true));
				self.$desc.find(".body").html(htmlescape($img.attr("data-body"), true));
				
				self.$desc.show();
				/** 
				self.$desc.animate({
					"left" : "0px"
				}, speed / 2 , function() {
					finish_move_animation();
				}); **/
				finish_move_animation();
				self.$desc._lock = false;
			})
	};
	self.show_desc = function() {
		if (self.$desc._lock) {
			return;
		}
		self.$desc
			.stop()
			.animate({
				"left" : "0px" 
			}, speed_desc ,"linear", function() {	
				self.$desc._lock = false;
			});
	};
	self.hide_desc = function() {
		if (self.$desc._lock) {
			return;
		}
		self.$desc
			.stop()
			.animate({
				"left" : (-1 * self.$desc.outerWidth()) + "px" 
			}, speed_desc ,"linear", function() {	
				self.$desc._lock = false;
			});
	};
	
	//=== init 
	( function() {
		//=== ul, images 
		self.$ul = $c.find("ul.images");
		self.$images = self.$ul.find("li")
			.css("position", "absolute")
			.css("top" , "0")
			.css("left" , "0");
		
		if (self.$images.size() <= 0) {
			return;
		}
		//=== desc 
		$c.append(
			'<div class="descriptions">' + 
				'<div class="dt"></div>' + 
				'<div class="category"></div>' + 
				'<div class="title"></div>' + 
				'<div class="body"></div>' + 
			'</div>');
		self.$desc = $c.find("> .descriptions")
			.css("position", "absolute")
			.css("top" , "53px")
			.css("left", "0")
			.hide();
		self.$desc._lock = false;
	
		//=== list 
		$c.append('<ul class="list"></ul>');
		self.$list = $c.find("ul.list");
		for (var i=self.$images.size(); i > 0; i--) {
			self.$list.append('<li><a href="javascript: void(0);">●</a></li>');
		}
		self.$list.find("a").css("opacity", "0.3");
		
		var top = ($c.outerHeight() - self.$list.outerHeight()) / 2;
		self.$list
			.css("top", top + "px");
		
		self.$list.find("li > a").click(function() {
			var $li = $(this).closest("li");
			var pos = self.$list.find("li").index($li);
			if (pos >= 0) {
				self.move(pos);
			}
		});
		
		//=== nav
		$c.append(
			'<ul class="nav">' + 
				'<li class="prev"><a href="javascript: void(0);">前へ</a></li>' + 
				'<li class="next"><a href="javascript: void(0);">次へ</a></li>' + 
			'</ul>');
		$c.find(".nav > .prev > a").click(function() {
			self.move("prev");
		});
		$c.find(".nav > .next > a").click(function() {
			self.move("next");
		});
		
		//=== timers
		setInterval(function() {
			if (self._onmouse_flg == false && self._locked == false) {
				self.move("next");
			}
		},5000);
		
		setInterval(function() {
			if (self._onmouse_flg == true && self._locked == false) {
				self.slide();
			}
			if (self._onmouse_flg) {
				if (! self.$desc._lock)
					self.show_desc();
			} else {
				if (! self.$desc._lock)
					self.hide_desc();
			}
		},100);
		
		//=== enter
		$c.hover(function() {
			self._onmouse_flg = true;
			$c.addClass("mouse-on");
		} , function() {
			self._onmouse_flg = false;
			$c.removeClass("mouse-on");
		});
		
		//=== とりあえず位置セット
		var top = 0;
		self.$images.each(function() {
			var $image = $(this);
			$image
				.css("top", top + "px");
			top += $image.outerHeight();
		});
		
		//=== 0 に初期化
		self.move(0);
	} )();
	return self;
};

jQuery(function() {
	$(".image-slider").imageSlider({
		
	});
});