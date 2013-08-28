
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

