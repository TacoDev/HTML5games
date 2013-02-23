
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