

jQuery.fn.googlemap = function(options) {
	var $this = $(this);
	options = $.extend({}, 
						jQuery.fn.googlemap.default_params , 
						options || {});
	$this.each(function () {
		var $c = $(this);
		var $i = new jQuery.fn.googlemap.GoogleMap($c, options);
		$c.data("GoogleMap" , $i);
	});
};

jQuery.fn.googlemap.default_params = {
	"point" : {"x": 35.664694 , "y": 139.700016} , 
	"address" : null 
};
jQuery.fn.googlemap.GoogleMap = function($c,options) {
	var self = this;
	
	if (! options.address && $c.attr("data-address")) {
		options.address = $c.attr("data-address");
	}
	
	self.$map = $c.find(".gmap-api");
	self.$link = $c.find(".gmap-link").hide();
	
	self.get_linkurl = function(point, address) {
		var p = point.y + "," + point.x;
		var url = build_url(
			"http://maps.google.co.jp/maps" ,
			{
				"f" : "q" ,
			//	"source" : "s_q" , 
				"hl" : "ja" , 
			//	"geocode" : "",
				"q" : (address || "") , 
			//	"aq" : "" , 
			//	"sll" : p , // "35.875442,139.690604" ,
			//	"sspn" : "0.003147,0.004458" , 
			//	"brcurrent" : "3,0x6018eaaa2892834d:0x14aea382db30c2e4,0" , 
				"ie" : "UTF8" , 
			//	"hq" : "", 
			//	"hnear" : (address || "") , 
				"ll" : p ,
			//	"spn" : "0.024342,0.036478" , 
				"z" : "14"
			} );
		return url;
	};
	self.zen2han = function(str) {
		var tables = ["１","1","２","2","３","3","４","4","５","5","６","6","７","7","８","8","９","9"];
		var i = 0;
		while( i < tables.length) {
			str = str.replace(tables[i],tables[i+1]);
			i += 2;
		}
		return str;
	};
	self.load_point = function(point, address) {
		var list = [
			{"address" : "東京都新宿区新宿1", "x" :35.689472 , "y" : 139.712419 } , 
			{"address" : "東京都新宿区新宿2", "x" :35.690078 , "y" : 139.707149 } , 
			{"address" : "東京都新宿区新宿3", "x" :35.691314 , "y" : 139.705435 } , 
			{"address" : "東京都新宿区新宿4", "x" :35.688904 , "y" : 139.703634 } , 
			{"address" : "東京都新宿区新宿5", "x" :35.693180 , "y" : 139.708668 } , 
			{"address" : "東京都新宿区新宿6", "x" :35.695403 , "y" : 139.710067 } , 
			{"address" : "東京都新宿区新宿7", "x" :35.699242 , "y" : 139.712137 } 
		];
		if (! point) {
			for (var i=0; i < list.length; i++) {
				var a1 = list[i].address;
				var a2 = self.zen2han(address);
					a2 = a2.substr( 0, a1.length);
				if (a1 == a2) {
					point = new google.map.LatLng(list[i].x, list[i].y);
					break;
				}
			}
		}
		if (! point) {
			self.show_error();
			return;
		} 
		// show 
		self.$map.show();
		
		self._map = new GMap2( self.$map.get(0) );
		self._map.addControl(new GSmallMapControl());
		self._map.addControl(new GMapTypeControl());
		
		if (self._marker) {
			self._map.removeOverlay(self._marker);
			self._marker = null;
		}
		
		self._map.setCenter(point, 13);
		self._marker = new GMarker(point);
		self._map.addOverlay( self._marker );
		
		
		if (address) {
			self.$link	
				.attr("href" , self.get_linkurl(point,address))
				.show();
		} else {
			self.$link.hide();
		}
	};
	self.show_error = function() {
		
	};
	
	//=== init ======
	( function() {
		if (GBrowserIsCompatible()) {
			self.geocoder = new GClientGeocoder();
			
			console.log(options);
			if (options.address) {
				self.geocoder.getLatLng(
					options.address , 
					function(point) {
						self.load_point(point, options.address );
					});
			} else if (options.point) {
				var point = new GLatLng(options.point.x, options.point.y);
				self.load_point(point);
			} else {
				self.show_error();
			}
		} 
	} )();
	
	return self;
};

jQuery(function() {
	$(".gmap").googlemap();
});
