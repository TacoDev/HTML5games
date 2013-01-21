TacoGame.Utils = new function (){
	/**
	* Loads an image and returns the pointer
	*/
	function loadImage(path, callback){
		if(!path){
			throw new Error("Path Is not set");
		}
			
		var img = new Image();
		img.src = path;
			
		if( callback ){
			img.onload = function (event) {
                callback(event.currentTarget);
            };
		}
		return img;
	}
	
	return {
		"loadImage": loadImage
	};
}
