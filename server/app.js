
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var socketobj = require('./socket');

var socketio = require('socket.io').listen(server);
socketio.on('connection' , function(socket) {
	new socketobj(socket);
});
/*
//=== map 
var map = {};
map.field = require('../datas/map-field.json');
map.dungeon = require('../datas/map-dungeon.json');

//=== players 
var players = {};

var socketio = require('socket.io').listen(server);
socketio.on('connection' , function(socket) {
	socket.emit('map sync', map);
	
	socket.on('player sync', function(player) {
		players[socket.id] = player; 
		socket.broadcast.emit('player sync' , player);
	});
	socket.on('player move', function(player,x0,y0,x1,y1,dir) {
		console.log(arguments);
		socket.broadcast.emit('player move' , player,x0,y0,x1,y1,dir);
	});
	socket.on('disconnect'  , function() {
		try {
			delete players[socket.id];
		} catch(e) { console.log(e); }
	});
	//=== init 
	( function() {
		for (var socket_id in players)
			socket.broadcast.emit('player sync' , player);
	})();
});
**/

