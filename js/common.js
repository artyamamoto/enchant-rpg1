
if (String.prototype.format == undefined) {
	String.prototype.format = function(arg) {
		var rep_fn = undefined;
		if (typeof arg == 'object') {
			rep_fn = function(m,k) { return arg[k]; };
		} else {
			var args = arguments;
			rep_fn = function(m,k) { return args[parseInt(k)]; }
		}
		return this.replace(/\{(\w+)\}/g, rep_fn );
	};
	function sprintf() {
		var args = Array.prototype.slice.apply(arguments);
		var str = args.shift();
		return str.format(args);
	}
	function vsprintf(str,args) {
		return str.format(args);
	}
}

Array.prototype.shuffle = function() {
	var i = this.length;
	while(i) {
		var j = Math.floor(Math.random() * i);
		var t = this[--i];
		this[i] = this[j];
		this[j] = t;
	}
	return this;
};	

function hexdec(hex) {
	hex = ('' + hex).replace(/[^0-9a-f]/gi,'');
	return parseInt(hex,16);
}
function dechex(n) {
	if (n < 0) 
		n = 0xFFFFFFFF + n + 1;
	return parseInt(n,10).toString(16);
}
function color16(r,g,b) {
	r = dechex(r & 0xFF);
	g = dechex(g & 0xFF);
	b = dechex(b & 0xFF);
	while(r.length < 2) r = '0' + r;
	while(g.length < 2) g = '0' + g;
	while(b.length < 2) b = '0' + b;
	return '#' + r + g + b;
}

function extend(options, defaults) {
	var opt = options;
	for (var k in defaults) {
		if (!( k in options)) {
			opt[k] = defaults[k];
		}
	}
	return opt;
}
function array_keys(ar) {
	var res = [];
	for (var k in ar) 
		res.push(k);
	return res;
}
function array_values(ar) {
	var res = [];
	for (var k in ar) 
		res.push(ar[k]);
	return res;
}


function rand(min, max) {
	if (arguments.length == 2) {
		
	} else if (arguments.length == 1) {
		max = min;
		min = 0;
	} else {
		return 0;
	}
	return Math.floor(Math.random() * max + min);
}
function intval(s,base,default_val) {
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
}

var async = {};
async.parallel = function(list,oncomplete) {
	var cnt = 0;
	var finish = function() {
		if (++cnt >= list.length) {
			oncomplete();
		}
	};
	for (var i=list.length -1; i>=0; i--) {
		var func = list[i];
		func.call(null, finish);
	}
};

