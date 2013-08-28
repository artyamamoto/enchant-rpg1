
jQuery.fn.fixedMenu = function(options) {
	var $this = $(this);
	options = $.extend({}, 
						jQuery.fn.fixedMenu.default_params , 
						options || {});
	$this.each(function () {
		var $c = $(this);
		var $i = new jQuery.fn.fixedMenu.fixedMenu($c, options);
		$c.data("fixedMenu" , $i);
	});
};
jQuery.fn.fixedMenu.default_params = {
	"menu" : "#fixed-menu" , 
	"zIndex" : "5000"
};
jQuery.fn.fixedMenu.fixedMenu = function($c,options) {
	var self = this;
	self.$menu = $(options.menu);
	
	self.repos = function() {
		var scrollTop = $("html,body").scrollTop() || 
						$(window).scrollTop() || 
						$(document).scrollTop();
		var top = $c.offset().top;
		
		//console.log(self._top, scrollTop);
		
		if (self._top > 0 && self._top < scrollTop) {
			//console.log("show");
			self.$menu
				.css("position" , "fixed")
				.css("top", "0")
				.css("left", "0")
				.css("width", $(window).width() + "px")
				.css("z-index", options.zIndex)
				.show();
		} else {
			self.$menu.hide();
		}
	};
	
	//=== init 
	( function() {
		self._top = $c.offset().top;
		$(window).bind("scroll",function() {
			self.repos();
		});
		$(window).bind("resize",function() {
			self.repos();
		});
	})();
	
	return self;
};

