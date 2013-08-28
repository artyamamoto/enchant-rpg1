

jQuery.fn.thumbs = function(options) {
	var $this = $(this);
	options = $.extend({}, 
						jQuery.fn.thumbs.default_params , 
						options || {});
	$this.each(function () {
		var $c = $(this);
		var $i = new jQuery.fn.thumbs.Thumbs($c, options);
		$c.data("Thumbs" , $i);
	});
};
jQuery.fn.thumbs.default_params = {
	"image-container" : ".image .inner" , 
	"prev" : ".image .nav a.prev" ,
	"next" : ".image .nav a.next" ,
	"thumbs" : ".thumbs li a",
	"message" : ".image p" , 
	"speed" : 250 , 
	"interval" : 5000 
};
jQuery.fn.thumbs.Thumbs = function($c,options) {
	var self = this;
	
	self.$image_c = $c.find(options["image-container"]);
	self.$image_ul = self.$image_c.find("ul");
	self.$images = self.$image_ul.find("li");
	
	self.$prev = $c.find(options.prev);
	self.$next = $c.find(options.next);
	self.$thumbs = $c.find(options.thumbs);
	self.$message = $c.find(options.message);
	
	self.idx = 0;
	
	var speed = options["speed"];
	var interval = options["interval"];
	
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
		
		var $target = self.$images.eq(idx);
		var left = intval($target.position().left);
		
		self.idx = idx;
		self.$message.text( self.$thumbs.eq(idx).find("img").attr("alt") );
		
		self.$thumbs.removeClass("active");
		self.$thumbs.eq(idx).addClass("active");
		
		
		self.$image_ul
			.animate({
				"left" : (-1 * left) + "px" 
			}, speed, null , function() {
				// finish_move_animation();
				// self.idx = idx;
				self._locked = false;
			});
	};
	
	//=== init =====================
	(function() {
		self.$prev.click(function() {
			self.move("prev");
		});
		self.$next.click(function() {
			self.move("next");
		});
		self.$thumbs.click(function() {
			var $this = $(this);
			var pos = self.$thumbs.index($this);
			
			self.move(pos);
		});
		
		self.$image_ul
			.css("position" , "absolute")
			.css("top" , "0")
			.css("left" , "0");
		
		// images 位置セット
		var left = 0;
		self.$images
			.css("position", "absolute")
			.css("top" , "0")
			.each(function() {
				var $image = $(this);
				$image
					.css("left", left + "px");
				left += $image.find("img").outerWidth();
			});
		self.move(0);

		//=== timers
		setInterval(function() {
			if (self._locked == false) {
				self.move("next");
			}
		}, interval);
		
		//=== prettyphoto
		if (jQuery.fn.prettyPhoto)
			self.$images.find("a").prettyPhoto();
	})();
	
	return this;
};



jQuery(function() {
	$(".section-house-detail-main").thumbs({
		"image-container" : ".image .inner" , 
		"prev" : ".image .nav a.prev" ,
		"next" : ".image .nav a.next" ,
		"thumbs" : ".thumbs li a",
		"message" : ".image p"
	});
	$(".section-house-detail-maina[rel^='prettyPhoto']").prettyPhoto();
});

