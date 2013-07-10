
(function () {

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
		var radiiSquared = Math.pow(circle1.radius + circle2.radius, 2);
		if ( distanceSquared < radiiSquared ) {
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
})();

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