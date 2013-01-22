function initGame() {
}


//Namespace for the game, placeholder for now
var TacoGame = {

}
var width = 500;
var pixelsPerTile = 10;

//May be multiple maps in the future
TacoGame.Map = new function () {
	//Game tile is a 25 * 25 pixel square
	var pixelsPerTile = 10;
	var minTileX = 0;
	var maxTileX = width;
	var minTileY = 0;
	var maxTileY = width;
	var scrollSpeed = 5;
	var entities = [];
	var unitSelected = false;
	
	var viewPort = {
		x : 0, 
		y : 0,
		width : 0,
		height : 0,
		maxTileX : maxTileX,
		maxTileY : maxTileY,
		
		getWidthConversion : function () {
			return (maxTileX * pixelsPerTile);
		},
		getHeightConversion : function () {
			return (maxTileY * pixelsPerTile);
		},
		getLeftPercent : function () {
			if(viewPort.x === 0) {
				return 0;
			}
			return viewPort.x / viewPort.getWidthConversion();
		},
		getTopPercent : function () {
			if(viewPort.y === 0) {
				return 0;
			}
			return viewPort.y / viewPort.getHeightConversion();
		},
		getWidthPercent : function () {
			if(viewPort.width === 0) {
				return 0;
			}
			return viewPort.width / viewPort.getWidthConversion();
		},
		getHeightPercent : function () {
			if(viewPort.height === 0) {
				return 0;
			}
			return viewPort.height / viewPort.getHeightConversion();
		}
	};
	
	var tiles = [];
	
	function handleResize() {
		viewPort.width  = window.innerWidth;
		viewPort.height = window.innerHeight;
	}
	
	function loadSprites() {
		/*TacoGame.Utils.loadImage(zealotSprite.imgURL,
		function (event) {
			zealotSprite.img = event.src;
		});*/
		TacoGame.Utils.loadImage(MarineSprite.prototype.imgURL,
		function (image) {
			MarineSprite.prototype.img = image;
		});
		var marineRadius = 8;
		entities.push(new TacoGame.Entity(new TacoGame.Circle(300, 500, marineRadius), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(500, 300, marineRadius), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(2500, 3000, marineRadius), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(4000, 700, marineRadius), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(6000, 100, marineRadius), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(3500, 7400, marineRadius), new MarineSprite()));
		entities.push(new TacoGame.Entity(new TacoGame.Circle(6000, 6400, marineRadius), new MarineSprite()));
	}
	
	return {
		init : function () {
			canvas = document.getElementById('gameScreen');
			window.addEventListener("resize", handleResize);
			handleResize();
			loadSprites();
		},
		
		scrollViewPort : function (directions) {
			if (directions.up) {
				viewPort.y = Math.max(viewPort.y - scrollSpeed * pixelsPerTile, 0);
			}
			if (directions.down) {
				viewPort.y = Math.min(viewPort.y + scrollSpeed * pixelsPerTile, maxTileY * pixelsPerTile - viewPort.height);
			}
			if (directions.right) {
				viewPort.x = Math.min(viewPort.x + scrollSpeed * pixelsPerTile, maxTileX * pixelsPerTile - viewPort.width);
			}
			if (directions.left) {
				viewPort.x = Math.max(viewPort.x - scrollSpeed * pixelsPerTile, 0);
			}
		},
		
		moveViewPort : function (newCoords) {
			viewPort.x = newCoords.x;
			viewPort.y = newCoords.y;
		},
		
		getViewPort : function () {
			return viewPort;
		},
		
		getEntities : function () {
			var spriteData = [];
			var viewPortRectangle = new TacoGame.Rectangle(viewPort.x, viewPort.y, viewPort.width, viewPort.height);
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].isLoaded() && Math.circleRectangleColliding(entities[i].getShape(), viewPortRectangle)) {
					spriteData.push(entities[i].getSpriteData(viewPort));
				}
			}
			return spriteData;
		},
		
		getAllEntities : function () {
			var spriteData = [];
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].isLoaded()) {
					spriteData.push(entities[i].getDrawData());
				}
			}
			return spriteData;
		},
		
		selectEntities : function (rectangle, keepSelection) {
			keepSelection = !!keepSelection;
			if(unitSelected) {
				unitSelected = keepSelection;
			}
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].selected) {
					entities[i].selected = keepSelection;
				}
				if(Math.circleRectangleColliding(entities[i].getShape(), rectangle)) {
					entities[i].selected = true;
					unitSelected = true;
				}
			}
		},
		
		deselectEntities : function () {
			unitSelected = false;
		},
		
		stepEntities : function () {
			for (var i = 0; i < entities.length; i++) {
				entities[i].step();
			}
		},
		
		isOccupied : function (x, y, r) {
			var c1 = new TacoGame.Circle(x, y, r)
			for (var i = 0; i < entities.length; i++) {
				if(Math.circlesColliding(entities[i].getShape(), c1)) {
					return true;
				}
			}
			return false;
		},
		
		setDestination : function (event) {
			for (var i = 0; i < entities.length; i++) {
				if(entities[i].selected) {
					entities[i].setDestination(event);
				}
			}
		},
		isUnitSelected : function () {
			return unitSelected;
		}
		
	}
}
window.addEventListener("load", TacoGame.Map.init);


TacoGame.Entity = function (_shape, spriteData) {
	
	//Valid shapes are CIRCLE and POYLGON, both are 2d
	var shape = _shape || {
		type:"undefined"
	}
	
	var desiredLoction = null;
	var miniMapColor = "#E30000";
	
	
	//public interface
	return {
		selected : false,
		
		getShape: function () {
			return shape;
		},
		
		getDrawData: function () {
			return {
				shape : "CIRCLE",
				color : miniMapColor,
				x: shape.x,
				y: shape.y
			
			};
		},
		
		isLoaded: function () {
			return !!(spriteData.img);
		},
		
		getSpriteData: function (viewPort) {
			spriteData.updateOffsets();
			return {
				img : spriteData.img,
				offsetX : spriteData.offsetX,
				offsetY: spriteData.offsetY,
				width: spriteData.width,
				height: spriteData.height,
				x: shape.x - viewPort.x - 32,
				y: shape.y - viewPort.y - 42,
				tX: shape.x,
				tY: shape.y,
				radius: shape.radius,
				scaleNegative: spriteData.scaleNegative,
				selected : this.selected
			}
		},
		
		step: function () {
			spriteData.step();
			if(desiredLoction) {
				if(desiredLoction.x === shape.x &&
					desiredLoction.y === shape.y ||
					desiredLoction.steps.length === 0) {
					desiredLoction = null;
					spriteData.setAction(0);
					return;
				} else {
					var step = desiredLoction.steps.pop();
					step.x *= pixelsPerTile;
					step.y *= pixelsPerTile;
					spriteData.setDegrees(Math.angleBetweenTwoPoints(step, shape));
					shape.x = step.x;
					shape.y = step.y;
				}
			}
		},
		
		setDestination : function (end) {
			var grid = [];
			var tmp = {};
			tmp.x = end.x;
			tmp.y = end.y;
			tmp.steps = astar.search(
				grid,
				{x:Math.round(end.x / pixelsPerTile), y:Math.round(end.y / pixelsPerTile)},
				{x:Math.round(shape.x / pixelsPerTile), y:Math.round(shape.y / pixelsPerTile)},
				true, 
				shape.radius);
			desiredLoction = tmp;
			spriteData.setAction(1);
		}
	}
}

TacoGame.Math = new function () {

	 Math.distanceBetweenSquared = function(p1, p2) {
		var dx = p2.x - p1.x;
		var dy = p2.y - p1.y;
		return ( dx * dx )  + ( dy * dy );
	}
	
	Math.distanceBetween = function(p1, p2) {
		return Math.sqrt(Math.distanceBetweenSquared(p1, p2));
	}
	
	Math.angleBetweenTwoPoints = function (p1, p2) {
		var degrees = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI + 270;
		return degrees % 360;
	}
	
	Math.circlesColliding = function (circle1, circle2) {
		//compare the distance to combined radii
		var distanceSquared = Math.distanceBetweenSquared(circle1, circle2);
		var radii = circle1.radius + circle2.radius;
		if ( distanceSquared < radii * radii ) {
			return true;
		} else {
			return false;
		}
	}
	//From  http://jsfromhell.com/math/is-point-in-poly
	Math.isPointInPolygon = function(polygon, pt){
		polygon = polygon.points;
		for(var c = false, i = -1, l = polygon.length, j = l - 1; ++i < l; j = i)
			((polygon[i].y <= pt.y && pt.y < polygon[j].y) || (polygon[j].y <= pt.y && pt.y < polygon[i].y))
			&& (pt.x < (polygon[j].x - polygon[i].x) * (pt.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)
			&& (c = !c);
		return c;
	}
	
	Math.circleRectangleColliding = function (circle, rectangle) {
		var rectPoints = rectangle.getPoints();
		if(Math.isPointInPolygon(new TacoGame.Poylgon(rectPoints), {x: circle.x, y: circle.y}) ||
			Math.lineInCircle(rectPoints[0].x, rectPoints[0].y, rectPoints[1].x, rectPoints[1].y, circle.x, circle.y, circle.radius)||
			Math.lineInCircle(rectPoints[1].x, rectPoints[1].y, rectPoints[2].x, rectPoints[2].y, circle.x, circle.y, circle.radius)||
			Math.lineInCircle(rectPoints[2].x, rectPoints[2].y, rectPoints[3].x, rectPoints[3].y, circle.x, circle.y, circle.radius)||
			Math.lineInCircle(rectPoints[3].x, rectPoints[3].y, rectPoints[0].x, rectPoints[0].y, circle.x, circle.y, circle.radius)) {
			return true;
		}
	}
	
	Math.lineInCircle = function (ax, ay, bx, by, cx, cy, cr) {
    var vx = bx - ax;
    var vy = by - ay;
    var xdiff = ax - cx;
    var ydiff = ay - cy;
    var a = Math.pow(vx, 2) + Math.pow(vy, 2);
    var b = 2 * ((vx * xdiff) + (vy * ydiff));
    var c = Math.pow(xdiff, 2) + Math.pow(ydiff, 2) - Math.pow(cr, 2);
    var quad = Math.pow(b, 2) - (4 * a * c);
    if (quad >= 0)
    {
        // An infinite collision is happening, but let's not stop here
        var quadsqrt=Math.sqrt(quad);
        for (var i = -1; i <= 1; i += 2)
        {
            // Returns the two coordinates of the intersection points
            var t = (i * -b + quadsqrt) / (2 * a);
            var x = ax + (i * vx * t);
            var y = ay + (i * vy * t);
            // If one of them is in the boundaries of the segment, it collides
            if (x >= Math.min(ax, bx) && x <= Math.max(ax, bx) && y >= Math.min(ay, by) && y <= Math.max(ay, by)) return true;
        }
    }
    return false;
}
}

//One per session
TacoGame.WorldSimulator = new function () {

	var commands = [];
	
	function gameObject() {

	}
	
	function stepWorld() {
		TacoGame.Map.stepEntities();
	}
	
	setInterval(stepWorld, 100);
	
	//This is the api for the simulator, may get rather large
	return {
		queueCommand : function (newCommand) {
			if(!newCommand.needsSync()) {
				newCommand.commit();
			}
			commands.push(newCommand);
		}
	}
}

var zealotSprite = new function () {
	var internal = this;
	
	this.imgURL = "http://imageshack.us/a/img708/1269/zealotx.png";
	this.startX = 25;
	this.startY = 25;
	this.width = 80;
	this.height = 80;
	this.spaceHeight = 128;
	this.spaceWidth = 128;

	internal.actions = [
		{min : 5, max : 6},
		{min : 5, max : 13},
		{min : 0, max : 5}
	];
	this.getMinMax = function(action) {
		return internal.actions[action] || false;
	}
	this.drawDeath = function () {
		for(var i = 0; i < 7; i++) {
			var offsetY = internal.startY + (internal.spaceHeight * 13);
			var offsetX = internal.startX + (internal.spaceWidth * i);
			drawCurrentOnTimeout(offsetX, offsetY, false, time * i);
		}
	}
}

var MarineSprite = function () {
	var internal = this;
	
	this.img; //Set by loader
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = 64;
	this.height = 64;
	this.scaleNegative = false;
	
	var startX = 0;
	var startY = 0;
	var spaceHeight = 64;
	var spaceWidth = 64;
	
	var actions = [
		{offset : 5, size : 1},//standing
		{offset : 5, size : 7},//walking
		{offset : 0, size : 5},//atacking
		{offset : 0, size : 7}//dying
	];
	
	var action = 0;
	var step = 0;
	var died = false;
	var degrees = 0;
	
	this.setDegrees = function (newDegrees) {
		degrees = newDegrees;
	};
	
	this.died = function () {
		died = true;
	};
	
	this.setAction = function (newAction) {
		step = 0;
		action = newAction;
	};
	
	this.step = function () {
		step++;
		if(died && (step > actions[action].size)) {
			return false;
		}
		step = step % actions[action].size + actions[action].offset;
		if(action === 0 && Math.round(Math.random() * 30) == 15) {
			degrees = Math.round(Math.random() * 360);
		}
		return true;
	};
	
	this.updateOffsets = function () {
		internal.scaleNegative = false;
		if(died) {
			internal.offsetY = startY + (spaceHeight * 13);
			internal.offsetX = startX + (spaceWidth * step);
			return;
		}
		var column = Math.floor(degrees / 11.25);
		
		if(column > 16) {
			internal.scaleNegative = true;
			column = 16 - (column % 16);
		}
		internal.offsetY = startY + (spaceHeight * step);
		internal.offsetX = startX + (spaceWidth * column);
	};
	
	this.drawDeath = function () {
		for(var i = 0; i < 7; i++) {
			var offsetY = internal.startY + (internal.spaceHeight * 13);
			var offsetX = internal.startX + (internal.spaceWidth * i);
			drawCurrentOnTimeout(offsetX, offsetY, false, time * i);
		}
	};

}
MarineSprite.prototype.imgURL = "http://img3.imageshack.us/img3/6937/marinez.png";

var zerglingSprite = new function () {
	var internal = this;
	this.imgURL = "http://img28.imageshack.us/img28/5176/zergling.png";
	this.startX = 25;
	this.startY = 25;
	this.width = 80;
	this.height = 80;
	this.spaceHeight = 128;
	this.spaceWidth = 128;
	this.actions = [
		{min : 5, max : 6},
		{min : 5, max : 12},
		{min : 0, max : 5},
		{min : 12, max : 17},
	];
	this.getMinMax = function(action) {
		return this.actions[action] || false;
	}
	
	this.drawDeath = function () {
		for(var i = 0; i < 7; i++) {
			var offsetY = internal.startY + (internal.spaceHeight * 17);
			var offsetX = internal.startX + (internal.spaceWidth * i);
			drawCurrentOnTimeout(offsetX, offsetY, false, time * i);
		}
	}
}



var astar = {
    init: function(grid) {
        for(var x = 0, xl = width; x < xl; x++) {
            for(var y = 0, yl = width; y < yl; y++) {
				if(!grid[x]) {
					grid[x] = [];
				}
                var node = {};
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.cost = 1;
                node.visited = false;
                node.closed = false;
                node.parent = null;
                node.x = x;
                node.y = y;
				grid[x].push(node);
            }
        }
    },
    heap: function() {
        return new BinaryHeap(function(node) { 
            return node.f; 
        });
    },
    search: function(grid, start, end, diagonal, radius, heuristic) {
        astar.init(grid);
        heuristic = heuristic || astar.manhattan;
        diagonal = !!diagonal;
		start.g = 0;
		var closestNode = start;
        var openHeap = astar.heap();
 
        openHeap.push(start);
 
        while(openHeap.size() > 0) {
 
            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();
 
            // End case -- result has been found, return the traced path.
            if(currentNode.x === end.x && currentNode.y === end.y) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }
 
            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;
 
            // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
            var neighbors = astar.neighbors(grid, currentNode, diagonal);
 
            for(var i=0, il = neighbors.length; i < il; i++) {
                var neighbor = neighbors[i];
 
                if(neighbor.closed || TacoGame.Map.isOccupied(neighbor.x, neighbor.y, radius)) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }
 
                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.cost;
                var beenVisited = neighbor.visited;
 
                if(!beenVisited || gScore < neighbor.g) {
 
                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic({x:neighbor.x, y:neighbor.y}, {x:end.x, y:end.y});
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
					closestNode = neighbor.g > closestNode.g ? neighbor : closestNode;
 
                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }
		
        // No result was found - give as close as we can get
		var curr = closestNode;
		var ret = [];
		while(curr.parent) {
			ret.push(curr);
			curr = curr.parent;
		}
		return ret.reverse();
    },
    manhattan: function(pos0, pos1) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
 
        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
    },
    neighbors: function(grid, node, diagonals) {
        var ret = [];
        var x = node.x;
        var y = node.y;
 
        // West
        if(grid[x-1] && grid[x-1][y]) {
            ret.push(grid[x-1][y]);
        }
 
        // East
        if(grid[x+1] && grid[x+1][y]) {
            ret.push(grid[x+1][y]);
        }
 
        // South
        if(grid[x] && grid[x][y-1]) {
            ret.push(grid[x][y-1]);
        }
 
        // North
        if(grid[x] && grid[x][y+1]) {
            ret.push(grid[x][y+1]);
        }
 
        if (diagonals) {
 
            // Southwest
            if(grid[x-1] && grid[x-1][y-1]) {
                ret.push(grid[x-1][y-1]);
            }
 
            // Southeast
            if(grid[x+1] && grid[x+1][y-1]) {
                ret.push(grid[x+1][y-1]);
            }
 
            // Northwest
            if(grid[x-1] && grid[x-1][y+1]) {
                ret.push(grid[x-1][y+1]);
            }
 
            // Northeast
            if(grid[x+1] && grid[x+1][y+1]) {
                ret.push(grid[x+1][y+1]);
            }
 
        }
 
        return ret;
    }
};


// Binary Heap
// Taken from http://eloquentjavascript.net/appendix2.html
// License: http://creativecommons.org/licenses/by/3.0/
function BinaryHeap(scoreFunction){
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },
  
  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {
    var len = this.content.length;
    // To remove a value, we must search through the array to find
    // it.
    for (var i = 0; i < len; i++) {
      if (this.content[i] == node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();
        if (i != len - 1) {
          this.content[i] = end;
          if (this.scoreFunction(end) < this.scoreFunction(node))
            this.sinkDown(i);
          else
            this.bubbleUp(i);
        }
        return;
      }
    }
    throw new Error("Node not found.");
  },

  size: function() {
    return this.content.length;
  },

  rescoreElement: function(node) {
  	this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];
    // When at 0, an element can not sink any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      var parentN = Math.floor((n + 1) / 2) - 1,
          parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },

  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

    while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) * 2, child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      var swap = null;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore)
          swap = child1N;
      }
      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N],
            child2Score = this.scoreFunction(child2);
        if (child2Score < (swap == null ? elemScore : child1Score))
          swap = child2N;
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap != null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};