/**
	jQuery Alert Dialogs Plugin 改造版
	
	■以下の設定の追加
	  ※呼び出し後にリセットされるため、呼び出し前に毎回変数を更新する必要がある。
	
	$.alerts.buttonHTML  : (String) ボタン部分のHTML
	$.alerts.showClose   : (Bool)   ×ボタンの表示
	$.alerts.mybtns      : (Array)  {"#selector" : function() {}} でコールバックを直接指定できる
	                                （$.alerts._hide() も暗黙には実行されない）
	$.alerts.beforeOK    : (Function) remove 前に実行される
	$.alerts.afterShow   : (Function) 表示直後
	
	$.showalert({
		"type" 		: "alert" , 
		"title" 	: title , 
		"message" 	: message , 		
		"value" 	: "",				// promptのみ
		
		"ok" 		: '&nbsp;OK&nbsp;', 			// null で非表示
		"cancel"	: '&nbsp;キャンセル&nbsp;' , 	// null で非表示
		"btn_html"	: '',							// ボタンHTML （ok/cancelに優先する）
		
		"closebtn" 	: false , 		// ×ボタン表示
		
		"callback" : function(r) {
			
		} , 
		"btn_callbacks" : {
			"#selector" : function() {
				// その他のボタンを指定した場合のコールバック
				// $.alerts._hide() も暗黙には実行されない
			}
		}
	});
	
	
*/

// jQuery Alert Dialogs Plugin
//
// Version 1.1
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
// 14 May 2009
//
// Visit http://abeautifulsite.net/notebook/87 for more information
//
// Usage:
//		jAlert( message, [title, callback] )
//		jConfirm( message, [title, callback] )
//		jPrompt( message, [value, title, callback] )
// 
// History:
//
//		1.00 - Released (29 December 2008)
//
//		1.01 - Fixed bug where unbinding would destroy all resize events
//
// License:
// 
// This plugin is dual-licensed under the GNU General Public License and the MIT License and
// is copyright 2008 A Beautiful Site, LLC. 
//
(function($) {
	var htmlescape = htmlescape || function(str) {
		str = "" + str;
		str = str.replace(/&/g,'&amp;');
		str = str.replace(/>/g,'&gt;');
		str = str.replace(/</g,'&lt;');
		str = str.replace(/"/g, '&quot;');
		return str;
	};
	$.showalert = function(options, _title, _callback) {
		if (typeof options != "object") {
			// $.showalert("message"[,"title"][, function() {}])
			var s = options;
			_title = _title || null;
			_callback = _callback || null;
			
			if (typeof _title == "function") {
				_callback = _title;
				_title = null;
			}
			options = {
				"title" 	: _title,
				"message"	: s , 
				"ok"		: '&nbsp;OK&nbsp;' , 
				'ok_class'	: 'ok' , 
				'cancel'	: '' ,
				"callback" 	: _callback
			};
		}
	
		var type = options.type || "alert";
		var defaults = {
			"title"			: null , 
			"message"		: "" ,
			"value"			: "" , 							// promptのみ
			
			"ok"			: '&nbsp;OK&nbsp;', 			// null で非表示
			'ok_class'		: '', 
			"cancel"		: '&nbsp;キャンセル&nbsp;' ,	// null で非表示
			'cancel_class'	: '', 
			'btn_html' 		: '',							// ボタンHTML （ok/cancelよりも優先する）
			"width"			: null,							// 幅
			
			'close_btn'		: false , 						// ×ボタン表示
			'callback'		: null , 						// コールバック
			"btn_callbacks"	: null ,							// その他ボタン
			
			"before_ok"		: null ,						// OK 時コールバック直前
			"before_cancel" : null,							// キャンセルコールバック直前
			"after_show" 	: null 							// 表示直後
		};
		if (type == "alert") {
			defaults.cancel = null;
		}
		
		options = $.extend(defaults ,options);
//		alert($.dump(options));
		//=== btn 
		if (options.btn_html) {
			$.alerts.buttonHTML = options.btn_html;
		} else {
			var s = '';
			if (options.ok) {
				s += '<input type="button" value="' + options.ok + '" id="popup_ok" ';
				if (options.ok_class) 
					s += 'class="'+ options.ok_class +'" ';
				s += '/>';
			} 
			if (options.cancel) {
				s += '<input type="button" value="' + options.cancel + '" id="popup_cancel" ';
				if (options.cancel_class) 
					s += 'class="'+ options.cancel_class +'" ';
				s += '/>';
			}
			$.alerts.buttonHTML = (s || '-');
		}
		
		//=== close btn 
		if (options.close_btn) {
			$.alerts.showClose = true;
		} else {
			$.alerts.showClose = false;
		}
		//=== callbacks
		if (options.btn_callbacks) {
			$.alerts.mybtns = options.btn_callbacks;
		}
		if (options.before_ok) {
			$.alerts.beforeOK = options.before_ok;
		}
		if (options.before_cancel) {
			$.alerts.beforeCancel = options.before_cancel;
		}
		if (options.after_show) {
			$.alerts.afterShow = options.after_show;
		}
		if (options.width) {
			$.alerts.width = options.width;
		}
		
		switch (type) {
			case 'alert' : 
				$.alerts.alert(options.message, options.title, options.callback);
			break;
			case 'confirm' : 
				$.alerts.confirm(options.message, options.title, options.callback);
			break;
			case 'prompt' : 
				$.alerts.prompt(options.message, options.value, options.title, options.callback);
			break;
		}
	};

	$.alerts = {
		
		// These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time
		
		verticalOffset: -75,                // vertical offset of the dialog from center screen, in pixels
		horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
		repositionOnResize: true,           // re-centers the dialog on window resize
		overlayOpacity: .5,                // transparency level of overlay
		overlayColor: '#000',               // base color of overlay
		draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
		okButton: '&nbsp;OK&nbsp;',         // text for the OK button
		cancelButton: '&nbsp;キャンセル&nbsp;', // text for the Cancel button
		dialogClass: null,                  // if specified, this class will be applied to all dialogs
		
		// ___CUSTOMIZE___
		buttonHTML : null , 
		showClose : false, 
		
		// Public methods
		
		alert: function(message, title, callback) {
			$.alerts._show(title, message, null, 'alert', function(result) {
				if( callback ) callback(result);
			});
		},
		
		confirm: function(message, title, callback) {
			$.alerts._show(title, message, null, 'confirm', function(result) {
				if( callback ) callback(result);
			});
		},
			
		prompt: function(message, value, title, callback) {
			$.alerts._show(title, message, value, 'prompt', function(result) {
				if( callback ) callback(result);
			});
		},
		
		// Private methods
		
		_show: function(title, msg, value, type, callback) {
			
			$.alerts._hide();
			$.alerts._overlay('show');
			
			if ($.alerts.showClose) {
				$("BODY").append(
				  '<div id="popup_container">' + 
				    '<h1 id="popup_title"></h1>' +
				  	'<div id="popup_close"><a href="javascript: void(0);">close</a></div>' + 
				    '<div id="popup_content">' +
				      '<div id="popup_message"></div>' +
					'</div>' +
				  '</div>' );
			} else {
				$("BODY").append(
				  '<div id="popup_container">' + 
				    '<h1 id="popup_title"></h1>' +
				    '<div id="popup_content">' +
				      '<div id="popup_message"></div>' +
					'</div>' +
				  '</div>' );
			}
			$.alerts.showClose = false;
			
			if( $.alerts.dialogClass ) $("#popup_container").addClass($.alerts.dialogClass);
			
			// IE6 Fix
			var pos = 'fixed';//($.browser.msie && parseInt($.browser.version) <= 6 ) ? 'absolute' : 'fixed'; 
			
			$("#popup_container").css({
				position: pos,
				zIndex: 99999,
				padding: 0,
				margin: 0
			});
			
			if (title) {
				// $("#popup_title").text(title).show();
				$("#popup_title").html( htmlescape(title).replace(/\n/,'<br />') ).show();
			} else 
				$("#popup_title").hide();
			$("#popup_content").addClass(type);
			
			if ($.alerts.html) {
				$("#popup_message").html(msg);
				$.alerts.html = false;
			} else 
				$("#popup_message").html( msg.replace(/\n/,'<br />') );
			
			
			$("#popup_container").css({
		//		minWidth: $("#popup_container").outerWidth(),
		//		maxWidth: $("#popup_container").outerWidth()
				minWidth: ($.alerts.width || $("#popup_container").outerWidth()),
				maxWidth: ($.alerts.width || $("#popup_container").outerWidth())
			}); 
			$.alerts.width = null;
			
			$.alerts._reposition();
			$.alerts._maintainPosition(true);
			
			switch( type ) {
				case 'alert':
					if ($.alerts.buttonHTML) {
						if ($.alerts.buttonHTML == "-") {
							// - の時は何も表示しない
						} else {
							$("#popup_message").after('<div id="popup_panel">' + $.alerts.buttonHTML + '</div>');
						}
						$.alerts.buttonHTML = null;
					} else {
						$("#popup_message").after('<div id="popup_panel"><input type="button" value="' + 
										$.alerts.okButton + '" id="popup_ok" /></div>');
					}
				//	$("#popup_ok").focus();
					$("#popup_ok").click( function() {
						if ($.alerts.beforeOK) {
							var func = $.alerts.beforeOK;
							func();
							$.alerts.beforeOK = null;
						}
						$.alerts._hide();
						callback(true);
					});
					$("#popup_ok").keypress( function(e) {
						if( e.keyCode == 13 || e.keyCode == 27 ) 
							$("#popup_ok").trigger('click');
					});
					$("#popup_cancel, #popup_close, #popup_overlay").click( function() {
						if ($.alerts.beforeCancel) {
							var func = $.alerts.beforeCancel;
							func();
							$.alerts.beforeCancel = null;
						}
						$.alerts._hide();
						if( callback ) callback(false);
					});

					// $.alerts.mybtns 
					if ($.alerts.mybtns ) {
						for (var k in $.alerts.mybtns) {
							var f = $.alerts.mybtns[k];
							$(k).click(f);
						}
					} 
					$.alerts.mybtns = null;
				break;
				case 'confirm':
					if ($.alerts.buttonHTML) {
						if ($.alerts.buttonHTML == "-") {
							// - の時は何も表示しない
						} else {
							$("#popup_message").after('<div id="popup_panel">' + $.alerts.buttonHTML + '</div>');
						}
						$.alerts.buttonHTML = null;
					} else {
						$("#popup_message").after(
								'<div id="popup_panel">'+ 
									'<input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /> ' + 
									'<input type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" />' + 
								'</div>');
					}
					
					$("#popup_ok").click( function() {
						if ($.alerts.beforeOK) {
							var func = $.alerts.beforeOK;
							var res = func();
							if (res === false) 
								return;
							$.alerts.beforeOK = null;
						}
						$.alerts._hide();
						if( callback ) callback(true);
					});
					$(".popup_other_btns").click( function() {
						var $this = $(this);
						$.alerts._hide();
						if( callback ) callback($this.attr("id"));
					});
					$("#popup_cancel, #popup_close, #popup_overlay").click( function() {
						if ($.alerts.beforeCancel) {
							var func = $.alerts.beforeCancel;
							var res = func();
							if (res === false) 
								return;
							$.alerts.beforeCancel = null;
						}
						$.alerts._hide();
						if( callback ) callback(false);
					});
				//	$("#popup_ok").focus();
					$("#popup_ok, #popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#popup_cancel").trigger('click');
					});
					
					// $.alerts.mybtns 
					if ($.alerts.mybtns ) {
						for (var k in $.alerts.mybtns) {
							var f = $.alerts.mybtns[k];
							$(k).click(f);
						}
					} 
					$.alerts.mybtns = null;
				break;
				case 'prompt':
					if ($.alerts.buttonHTML) {
						$("#popup_message")
							.append('<br /><input type="text" size="30" id="popup_prompt" />')
							.after('<div id="popup_panel">' + $.alerts.buttonHTML + '</div>');
						$.alerts.buttonHTML = null;
					} else {
						$("#popup_message")
							.append('<br /><input type="text" size="30" id="popup_prompt" />')
							.after(
								'<div id="popup_panel">' + 
									'<input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /> ' + 
									'<input type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" />' + 
								'</div>');
					}
				
					$("#popup_prompt").width( $("#popup_message").width() );
					$("#popup_ok").click( function() {
						if ($.alerts.beforeOK) {
							var func = $.alerts.beforeOK;
							func();
							$.alerts.beforeOK = null;
						}
						var val = $("#popup_prompt").val();
						$.alerts._hide();
						if( callback ) callback( val );
					});
					$("#popup_cancel, #popup_close, #popup_overlay").click( function() {
						$.alerts._hide();
						if( callback ) callback( null );
					});
					$("#popup_prompt, #popup_ok, #popup_cancel").keypress( function(e) {
						if( e.keyCode == 13 ) $("#popup_ok").trigger('click');
						if( e.keyCode == 27 ) $("#popup_cancel").trigger('click');
					});
					if( value ) $("#popup_prompt").val(value);
					$("#popup_prompt").focus().select();
				break;
			}
			
			// Make draggable
			if( $.alerts.draggable ) {
				try {
					$("#popup_container").draggable({ handle: $("#popup_title") });
					$("#popup_title").css({ cursor: 'move' });
				} catch(e) { /* requires jQuery UI draggables */ }
			}
			
			// after show 
			if ($.alerts.afterShow) {
				var func = $.alerts.afterShow;
				func();
				
				$.alerts.afterShow = null;
			}
		},
		
		_hide: function() {
			$("#popup_container").remove();
			$.alerts._overlay('hide');
			$.alerts._maintainPosition(false);
		},
		
		_overlay: function(status) {
			switch( status ) {
				case 'show':
					$.alerts._overlay('hide');
					$("BODY").append('<div id="popup_overlay"></div>');
					$("#popup_overlay").css({
						position: 'absolute',
						zIndex: 99998,
						top: '0px',
						left: '0px',
						width: '100%',
						height: $(document).height(),
						background: $.alerts.overlayColor,
						opacity: $.alerts.overlayOpacity
					});
				break;
				case 'hide':
					$("#popup_overlay").remove();
				break;
			}
		},
		
		_reposition: function() {
			var top = (($(window).height() / 2) - ($("#popup_container").outerHeight() / 2)) + $.alerts.verticalOffset;
			var left = (($(window).width() / 2) - ($("#popup_container").outerWidth() / 2)) + $.alerts.horizontalOffset;
			if( top < 0 ) top = 0;
			if( left < 0 ) left = 0;
			
			// IE6 fix
			// if( $.browser.msie && parseInt($.browser.version) <= 6 ) top = top + $(window).scrollTop();
			
			$("#popup_container").css({
				top: top + 'px',
				left: left + 'px'
			});
			$("#popup_overlay").height( $(document).height() );
		},
		
		_maintainPosition: function(status) {
			if( $.alerts.repositionOnResize ) {
				switch(status) {
					case true:
						$(window).bind('resize', $.alerts._reposition);
					break;
					case false:
						$(window).unbind('resize', $.alerts._reposition);
					break;
				}
			}
		}
		
	}
	
	// Shortuct functions
	jAlert = function(message, title, callback) {
		if (typeof title == "function") {
			callback = title;
			title = null;
		}
		$.alerts.alert(message, title, callback);
	}
	
	jConfirm = function(message, title, callback) {
		if (typeof title == "function") {
			callback = title;
			title = null;
		}
		$.alerts.confirm(message, title, callback);
	};
		
	jPrompt = function(message, value, title, callback) {
		if (typeof title == "function") {
			callback = title;
			title = null;
		}
		$.alerts.prompt(message, value, title, callback);
	};
	
})(jQuery);

