
var Player = Class.create(Character, {
	"name" : null , 

	"sync" : function() {
		if (! this.name) 
			return;
		
		socket.emit('player sync' , {
			"name" : this.name , 
			"pos" : this.pos , 
			"map" : this.map 
		});
	} ,
	
	"initialize" : function() {
		Character.call(this);
		this.pos = {"x":0 , "y":0};
		this.map = {"type":null, "x":0, "y":0};
	}
});
Player._instance = null;
Player.getInstance = function() {
	if (! Player._instance) 
		Player._instance = new Player();
	return Player._instance;
};


