
var Player = Class.create(Character, {
	"name" : "あそびにん" , 
	"initialize" : function() {
		Character.call(this);
	}
});
Player._instance = null;
Player.getInstance = function() {
	if (! Player._instance) 
		Player._instance = new Player();
	return Player._instance;
};


