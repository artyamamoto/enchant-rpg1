
(function($) {

/**
$.loading()
$.loading({
	message : message , 
	title : title , 
	cancel : function() {} 
});

$.loading.show(...);
$.loading.hide();

*/
$.loading = function(options,title,cancel_callback) {
	return $.loading.show(options,title,cancel_callback);
};
// show --------------------
$.loading.show = function(options,_title,_cancel) {	
	$.loading.hide();
	
	options = $.extend({}, {
		"message"  : '<img src="/r2013/lib/jquery.loading/images/loading-bar.gif" />'  ,
		"title" : '読み込み中' , 
		"cancel" : false // boolean or function() {}
	} ,options);
	
	// init 
	if ($("#jquery-loading").size() <= 0) {
		var tmpl = '<div id="jquery-loading" style="display: none;">' + 
			'<div class="jquery-loading-close"><a href="javascript: void(0);">close</a></div>' + 
			'<div class="jquery-loading-title"></div>' + 
			'<div class="jquery-loading-message"></div>' + 
			'</div>';
		$("BODY").append(tmpl);
	}
	
	options.title ? 
		$("#jquery-loading .jquery-loading-title").text(options.title) :
		$("#jquery-loading .jquery-loading-title").hide();
	$("#jquery-loading .jquery-loading-message").html(options.message);
	
	(options.cancel === false) ?
		$("#jquery-loading .jquery-loading-close").hide().unbind("click") : 
		$("#jquery-loading .jquery-loading-close").show().unbind("click");
	if (options.cancel) {
		$("#jquery-loading .jquery-loading-close a")
			.bind("click" , function() {
				var ret = true;
				if (options.cancel && $.isFunction(options.cancel)) {
					ret = options.cancel();
				}
				if (ret !== false)
					$.loading.hide();
				return false;
			});
	}
	
	$("#jquery-loading").show();
	$.loading._pos.observe();
};
// hide ---------------------
$.loading.hide = function() {
	$("#jquery-loading").hide();
	$.loading._pos.observe_stop();
};
// pos -----------------------
$.loading._pos = function() {
	var top = (($(window).height() / 2) - ($("#jquery-loading").height() / 2));
	var left = (($(window).width() / 2) - ($("#jquery-loading").width() / 2));
	if( top < 0 ) top = 0;
	if( left < 0 ) left = 0;
	
	$("#jquery-loading")
		.css("top" , top + "px")
		.css("left" , left + "px")
		.css("position" , "absolute")
		.css("z-index" , "99999");
};
$.loading._pos.observe = function() {
	$.loading._pos();
	
	$.loading._pos.timer_id = setTimeout(function() {
		$.loading._pos.observe();
	}, 500);
};
$.loading._pos.observe_stop = function() {
	if ($.loading._pos.timer_id) {
		clearTimeout($.loading._pos.timer_id);
		$.loading._pos.timer_id = null;
	}
};

/*
jQuery(function() {
	$.loading();
}); */

})(jQuery);
