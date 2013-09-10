
var datas = require('../datas');

var socketobj = function(socket) {
	var self = this;
	self.socket = socket;
	// self.socket_id = socket.id;
	
	//=== broadcast
	self.broadcast = {};
	self.broadcast.sync = function() {
		self.socket.broadcast.emit('player sync', self.socket.id, datas.players[self.socket.id]);
	};
	self.broadcast.move = function(x0,y0,x1,y1,dir) {
		self.socket.broadcast.emit('player move', self.socket.id, datas.players[self.socket.id], x0,y0,x1,y1,dir);
	};
	//=== listeners 
	self.listeners = {};
	self.listeners.sync = function(player) {
		datas.players[self.socket.id] = player;
		self.broadcast.sync();
	};
	self.listeners.move = function() {
		// datas.players[self.socket.id] = player;
		self.broadcast.move.apply(self , arguments);
	};
	self.listeners.disconnect = function() {
		try {
			delete datas.players[self.socket.id];
		} catch(e) {}	
	};
	//=== init
	( function() {
		// map
		self.socket.emit('map sync' , datas.map);
		
		// players 
		for (var socket_id in datas.players) 
			self.socket.emit('player sync' , socket_id, datas.players[socket_id]);
		
		// listeners 
		socket.on('player sync' , self.listeners.sync);
		socket.on('plyaer move' , self.listeners.move);
		socket.on('disconnect' , self.listeners.disconnect);
	})();

	return self;
};

module.exports = socketobj;

