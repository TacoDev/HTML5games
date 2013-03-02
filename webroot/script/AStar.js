
var width = 250;
var pixelsPerTile = 10;

onmessage = function(e){
	var p = JSON.parse(e.data);
	//var p = e.data; //Without JSON
	done(astar.search(p.grid, p.start, p.end, p.moveSpeed), p.messageId);
};

function done(returnVal, messageId){
	// Send back the results to the parent page
	postMessage(JSON.stringify({path:returnVal,messageId:messageId}));
	//postMessage({data:JSON.stringify({path:returnVal,id:id})}); //Debug
	//postMessage({data:{path:returnVal,id:id}}); //Without workers
}
function createNode(x, y, closed) {
	return {
		f:0,
		g:0,
		h:0,
		cost:1,
		visited:false,
		closed:closed,
		parent:null,
		x:x,
		y:y
	}
}

function returnPath(curr) {
	var ret = [];
	while(curr.parent) {
		ret.push({
			x:curr.x * pixelsPerTile,
			y:curr.y * pixelsPerTile
		});
		curr = curr.parent;
	}
	return ret.reverse();
}

var astar = {
    init: function(start) {
		var node = createNode(start.x, start.y, true);
		node.visited = true;
		return node;
    },
    heap: function() {
        return new BinaryHeap(function(node) { 
            return node.f; 
        });
    },
    search: function(grid, start, end, moveSpeed) {
        var first = astar.init(start);
        var heuristic = astar.manhattan;
		
		var closestNode = first;
		closestNode.h = heuristic({x:closestNode.x, y:closestNode.y}, {x:end.x, y:end.y});
        var openHeap = astar.heap();
 
        openHeap.push(first);
 
        while(openHeap.size() > 0) {
 
            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();
 
            // End case -- result has been found, return the traced path.
            if(currentNode.x === end.x && currentNode.y === end.y) {
				return returnPath(currentNode);
            }
 
            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;
 
            // Find all neighbors for the current node.
            var neighbors = astar.neighbors(grid, currentNode, moveSpeed);
 
            for(var i=0, il = neighbors.length; i < il; i++) {
                var neighbor = neighbors[i];
 
                if(neighbor.closed) {
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
					closestNode = (closestNode.f > neighbor.f) ? neighbor : closestNode;
 
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
		
		if(closestNode) {
			return returnPath(closestNode);
		}
		return [];
    },
    manhattan: function(pos0, pos1) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
    },
    neighbors: function(grid, node, moveSpeed) {
        var ret = [];
        var x = node.x;
		var x1 = x + moveSpeed;
		var xs1 = x - moveSpeed;
        var y = node.y;
		var y1 = y + moveSpeed;
		var ys1 = y - moveSpeed;
		if(!grid[x]) {
			grid[x] = [];
		}
		//TODO: Change to use collision instead of fixed graph
		function setGrid(x, y) {
			if(grid[x][y] && grid[x][y].cost) {
				grid[x][y] = grid[x][y];
			} else if (grid[x][y]) {
				grid[x][y] = createNode(x, y, grid[x][y].closed);
			} else {
				grid[x][y] = createNode(x, y, false);
			}
			return grid[x][y];
		}
		
        // West
        if(x > 0) {
			if(!grid[xs1]) {
				grid[xs1] = [];
			}
            ret.push(setGrid(xs1, y));
			
			// Southwest
			if(y > 0) {
				ret.push(setGrid(xs1, ys1));
			}
			// Northwest
			if(y < width) {
				ret.push(setGrid(xs1, y1));
			}
        }
 
        // East
        if(x < width) {
			if(!grid[x1]) {
				grid[x1] = [];
			}
			ret.push(setGrid(x1, y));
			
			// Southeast
			if(y > 0) {
				ret.push(setGrid(x1, ys1));
			}

			// Northeast
			if(y < width) {
				ret.push(setGrid(x1, y1));
			}
        }
 
        // South
        if(y > 0) {
			ret.push(setGrid(x, ys1));
        }
 
        // North
        if(y < width) {
			ret.push(setGrid(x, y1));
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