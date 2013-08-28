
var TextSuggestForm = function($form, options) {
	var self = this;
	
	var $input,  $a , $pulldown;
	var input_is_created = false;
	
	// 初期化
	$a = $form.find("a.suggest");
	
	$input = $form.find("input[type=\"text\"]");
	if ($input.size() <= 0) {
		$form.append('<div class="suggest-hidden-text"><input type="text" value="" /></div>');
		$input = $form.find("input[type=\"text\"]");
		input_is_created = true;
	}
	
	$pulldown = $form.find(".suggest-pulldown");
	if ($pulldown.size() <= 0) {
		$form.append('<div class="suggest-pulldown"></div>');
		$pulldown = $form.find(".suggest-pulldown");
	}

	var htmlescape = htmlescape || function(str) {
		str = "" + str;
		str = str.replace(/&/g,'&amp;');
		str = str.replace(/>/g,'&gt;');
		str = str.replace(/</g,'&lt;');
		str = str.replace(/"/g, '&quot;');
		return str;
	};

	self.request = function() {
		self.pulldown.loading();
	
		self._get_datas(function(res) {
			self.pulldown.list(res);
		});
	};	
	self._get_datas = function(next) {
		var params = {};
		$.post(options["suggest-url"] , params, function(res,status) {
			next(res);
		}, "json");
	};
	if (options["get-datas"]) {
		self._get_datas = options["get-datas"];
	}
	self._set_value = function(str,v) {
		if ($input.size() > 0)
			$input.val(str);
	};
	if (options["set-value"]) {
		self._set_value = options["set-value"];
	}
	// pulldown
	self.pulldown = {};
	self.pulldown.hide = function() {
		if ($pulldown.is(":visible")) {
			$pulldown.hide();
			$input.unbind("keydown");
		}
	};	
	self.pulldown.show = function(htmlstr,cls) {
		$pulldown.show();
		if (! cls) 
			cls = "default";

		htmlstr = '<div class="suggest-' + cls + '">' + 
					htmlstr + '</div>';
		$pulldown.html(htmlstr);
		
		var height = $input.outerHeight() || 
				$input.attr("offsetHeight") || 
				$input.attr("clientHeight") ||
				$input.height();
		$pulldown
			.css("position", "absolute")
			.css("left" , "-1px")
			//.css("top" , ($input.position().top + height + 1) + "px")
			.css("top" , ($form.outerHeight() - 1) + "px")
			.css("width" , ($form.outerWidth() -2 ) + "px")
			.css("z-index", options["z-index"]);
		
		$pulldown.unbind("mouseenter").unbind("mouseleave")
			.bind("mouseenter" , function() { $pulldown._enter = true; })
			.bind("mouseleave" , function() { $pulldown._enter = false; });
		
		$pulldown.find("ul > li > a")
			// click 
			.unbind("click")
			.click(function(evt) {
				var $a = $(this);
				//if ($a.attr("href") && $a.attr("href").indexOf("void") < 0) 
				//	return true;	// normal link
				
				var str = $a.text();
				var v = $a.attr("data-value");
				
				self._set_value(str,v);
				self.pulldown.hide();
				
				return false;
			})
			// hover
			.unbind("mouseover").unbind("mouseout")
			.hover(function(evt) {
				var $a = $(this);
				$pulldown.find("ul > li").removeClass("active");
				$a.closest("li").addClass("active");
			},function(evt) {
				var $a = $(this);
				$a.closest("li").removeClass("active");
			});
		
		$input.unbind("keydown")
			.keydown(function(evt) {
				if (evt.keyCode) {
					console.log(evt.keyCode);
					
					if (evt.keyCode == 13) {
						var $a = $pulldown.find("ul > li.active a");
						if ($a.size() > 0) 
							$a.click();
						return false;
					}
					
					var dir = 0;
					if (evt.keyCode == 37 || evt.keyCode == 38) {
						dir = -1;
					} else if (evt.keyCode == 39 || evt.keyCode == 40){
						dir = 1;
					}
					if (dir != 0) {
						var idx = -1;
						var $li = $pulldown.find("ul > li.active");
						if ($li.size() == 0) {
							idx = 0;
						} else {
							idx = $pulldown.find("ul > li").index($li);
							var len = $pulldown.find("ul > li").size();
							
							idx = (idx + len + dir) % len;
						}
						$pulldown.find("ul > li").removeClass("active");
						$pulldown.find("ul > li").eq(idx).addClass("active");
						return false;
					}
				}
			});
	};
	self.pulldown.loading = function (){
		self.pulldown.show(options["loading"], "loading");
	};
	self.pulldown.list = function(ar) {
		var str = "";
		for (var i=0; i < ar.length; i++) {
			var url = ar[i].url || "javascript: void(0); ";
			var s = ar[i].text || "";
			var v = ar[i].data || "";
			
			str += '<li><a href="' + htmlescape(url) + '" data-value="' + htmlescape(v) + '">' + 
						htmlescape(s) + 
					'</a></li>';
		}
		self.pulldown.show('<ul>' + str + '</ul>', "list");
		//$pulldown.find(".suggest-list > ul > li > a").bind("click" , function() {
		//	self.pulldown.click();
		//});
	};
	//=== init 
	( function() {
		$form.addClass("suggest-form");
		self.pulldown.hide();
		
		if ($a.size() > 0) {
			$a.bind("click" , function() {
				$input.focus();
				self.request();
				return false;
			});
		} /*else if ($input.size() > 0) {
			$input.bind("focus" , function() {
				self.request();
			});
		} */ else {
			if (input_is_created == true) { 
				$form.css("position", "relative");
				
				$a = $('<a href="javascript: void(0);"></a>').appendTo($form);
				$a.css("position", "absolute")
					.css("top", 0)
					.css("left", 0)
					.css("width" , $form.outerWidth() + "px")
					.css("height", $form.outerHeight() + "px");
				
				$a.bind("click" , function() {
					$input.focus();
					return false;
				});
			}
			$input.bind("focus" , function() {
				self.request();
			});
		}
		$input.bind("blur" , function() {
			if ($pulldown._enter) {
				setTimeout(function() {
					self.pulldown.hide();
				}, 200);
			} else {	
				self.pulldown.hide();
			}
		});
	})();
	return self;
};

jQuery.fn.textSuggest = function(opts) {
	var $this = $(this);
	var options = {};
	for (var k in opts)	
		options[k] = opts[k];
	
	if (! options["suggest-url"] && $this.attr("data-suggest")) 
		options["suggest-url"] = $this.attr("data-suggest");
	
	options = $.extend({},
						jQuery.fn.textSuggest.default_params , 
						options || {});
	
	$this.each(function () {
		var $form = $(this);
		setTimeout(function() {
			var $i = new TextSuggestForm($form, options);
			$form.data("TextSuggestForm" , $i);
		} , 500);
	});
};
jQuery.fn.textSuggest.default_params = {
	"suggest-url" : "/r2013/lib/suggest/suggest.php" ,
	"loading" : "now loading..." , 
	"z-index" : 99999 ,
	"get-datas" : null , // callback
	"set-value" : null // callback
};

jQuery(function($) {
	$("[data-suggest]").textSuggest({
		/**
		"get-datas" : function(next) {
			next([
					{"text" : "aaa" , "url" : "aaa" } , 
					{"text" : "ddd" , "url" : "bbb" } , 
					{"text" : "ccc" , "url" : "ccc" } 
			]);
		} */	
	});
});
