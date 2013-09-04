
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

