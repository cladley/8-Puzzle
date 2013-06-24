function MinPQ(compareFn) {
    this.compare = compareFn;
    this.pq = [];
    this.N = 0;
}

MinPQ.prototype = {

    constructor: MinPQ,

    isEmpty: function () {
        return this.N === 0;
    },

    insert: function (key) {
        this.pq[++this.N] = key;
        this.swim(this.N);
    },

    delMin: function () {
        if (!this.isEmpty()) {
            this.exch(1, this.N);
            var min = this.pq[this.N--];
            this.sink(1);
            this.pq[this.N + 1] = null;
            return min;
        }
    },

    greater: function (i, j) {
        return this.pq[i].compareTo(this.pq[j]) > 0;
        //return this.compare(this.pq[i], this.pq[j]) > 0;
    },

    exch: function (i, j) {
        var t = this.pq[i];
        this.pq[i] = this.pq[j];
        this.pq[j] = t;
    },

    swim: function (k) {
        while (k > 1 && this.greater(Math.floor(k / 2), k)) {
            this.exch(k, Math.floor(k / 2));
            k = Math.floor(k / 2);
        }
    },

    sink: function (k) {
        while (2 * k <= this.N) {
            // We swap with the larger of the children
            var j = 2 * k;

            if (j < this.N && this.greater(j, j + 1))
                j++;
            if (!this.greater(k, j)) break;

            this.exch(k, j);
            k = j;
        }
    }

};

function Board(blocks) {

    this.blocks = blocks;
    this.N = blocks[0].length;
    this.move;
    this.blankR = 0;
    this.blankC = 0;
    this.blank;
    this.hammingScore = 0;
    this.manhattanScore = 0;
    this.contructGoalBoard();

};
Board.prototype.dimension = function () {
    return this.N;
};
Board.prototype.contructGoalBoard = function(){

    var hScore = 0;
    var mScore = 0;
    var counter = 1;

    for (var i = 0; i < this.N; i++) {
        for (var j = 0; j < this.N; j++) {

            if (this.blocks[i][j] === 0) {
                this.blankR = i;
                this.blankC = j;
                this.blank = [i, j];
            }
            // Calculate the Hamming and Manhattan here since we are 
            // going through the board to find the blank space

            if (this.blocks[i][j] !== 0) {


                if (this.blocks[i][j] !== counter) {
                    hScore += 1;

                    var cRow = i;
                    var cCol = j;
                    var val = this.blocks[i][j];

                    if (val !== 0) {
                        val -= 1;
                    }

                    var wRow = Math.floor(val / this.N);
                    var wCol = Math.floor(val % this.N);
                    //var wRow = val / this.N;
                    //var wCol = val % this.N;

                    mScore += Math.abs(cRow - wRow);
                    mScore += Math.abs(cCol, wCol);
                }
            }
            counter += 1;

        }

        this.hammingScore = hScore;
        this.manhattanScore = mScore;

    }

};
Board.prototype.hamming = function () {
    return this.hammingScore;
};
Board.prototype.manhattan = function () {
    return this.manhattanScore;
};
Board.prototype.getNeighbours = function () {
    var b = this.blank;
    var a = [];
    var limit = this.N - 1;

    a.push([b[0] + 1, b[1]]);
    a.push([b[0] - 1, b[1]]);
    a.push([b[0], b[1] + 1]);
    a.push([b[0], b[1] - 1]);

    a = a.filter(function (arg) {
        return ((arg[0] <= limit && arg[0] >= 0) && (arg[1] <= limit && arg[1] >= 0))
    });

    var neighbours = [];
    for (var i = 0; i < a.length; i++) {
        var newBlocks = this.createNewBlocks(a[i]);
        var n = new Board(newBlocks);
        n.move = newBlocks.move;
        n.prevBlank = { 'from': b, 'to': a[i] };
        n.steps = this.steps + 1;
        n.prevNode = this;
        neighbours.push(n);
    }

    return neighbours;
};
Board.prototype.twin = function () {

    // Check to see if both position aren't zero
    var r = this.blocks[0][0] * this.blocks[0][1];
    var copiedBlocks = copy(this.blocks);

    if (r !== 0) {
        // I can swap [0][0] and [0][1]
        this._tiles_swapped = { tile_1: { x: 0, y: 0 }, tile_2: { x: 0, y: 1 }};
        copiedBlocks = this.swap(copiedBlocks, 0, 0, 0, 1);
        var brd = new Board(copiedBlocks);
        return brd;
    } else {
        // I can swap [1][0] and [1][1]
        this._tiles_swapped = { tile_1: { x: 1, y: 0 }, tile_2: { x: 1, y: 1 }};
        copiedBlocks = this.swap(copiedBlocks, 1, 0, 1, 1);
        var brd = new Board(copiedBlocks);
        return brd;
    }

};

Board.prototype.tiles_swapped = function () {
    return this._tiles_swapped;
}

Board.prototype.swap = function (blks, x1, y1, x2, y2) {
    var temp = blks[x1][y1];
    blks[x1][y1] = blks[x2][y2];
    blks[x2][y2] = temp;
    return blks;
};
Board.prototype.createNewBlocks = function (newPosition) {
    function copy(arr) {
        var new_arr = arr.slice(0);
        for (var i = new_arr.length; i--;)
            if (new_arr[i] instanceof Array)
                new_arr[i] = copy(new_arr[i]);
        return new_arr;
    }
    var blank = this.blank;
    var newBlocks = copy(this.blocks);
    var row = newPosition[0];
    var col = newPosition[1];
    newBlocks[blank[0]][blank[1]] = this.blocks[newPosition[0]][newPosition[1]];
    newBlocks[newPosition[0]][newPosition[1]] = 0;
    // Just attaching the move to the blocks array. Will do for now, because javascript is cool like that
    newBlocks.move = [row, col];
    return newBlocks;
};
Board.prototype.isGoal = function () {
    var maximum = this.N * this.N;
    var counter = 0;

    for (var i = 0; i < this.N; i++)
        for (var j = 0; j < this.N; j++) {
            counter += 1;
            if (counter === maximum)
                return true;
            if (this.blocks[i][j] !== counter)
                return false;
        }

    return true;
};
Board.prototype.equals = function (other) {
    if (this.N !== other.blocks[0].length)
        return false;

    for (var i = 0; i < this.N; i++) {
        for (var k = 0; k < this.N; k++) {
            if (this.blocks[i][k] !== other.blocks[i][k])
                return false;
        }
    }
    return true;
};
Board.prototype.printBoard = function () {
    var s = "";
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            s += this.blocks[i][j] + ", ";
        }
        s += "\n";
    }
    s += this.move;

};


function copy(arr) {
    var new_arr = arr.slice(0);
    for (var i = new_arr.length; i--;)
        if (new_arr[i] instanceof Array)
            new_arr[i] = copy(new_arr[i]);
    return new_arr;
}

function nodeComparer(n1, n2) {
    function doCompare(method) {
        if (n1[method]() < n2[method]())
            return -1;
        else if (n1[method]() > n2[method]())
            return 1;
        else return 0;
    }

    var r = doCompare("Manhatten");
    if (r === 0)
        return doCompare("Hamming");
    else return r;

}


function Node(board, prev, steps) {
    this.board = board;
    this.prev = prev;
    this.steps = steps || 0;
}
Node.prototype.score = function (method) {
    if(method === undefined)
        return this.board.manhattan() + this.steps;
    
    if(method == "hamming")
        return this.board.hamming() + this.steps;
}

Node.prototype.compareTo = function (other) {
    if (this.score() < other.score())
        return -1;
    if (this.score() > other.score()) {
        return 1;
    } else {
        if (this.score('hamming') < other.score('hamming')) {
            return -1;
        }
        if (this.score('hamming') > other.score('hamming')) {
            return 1;
        }
    }
    return 0;
}


var Solver = (function () {
    var solution;
    var winning_board;
    var obj = {
        solvable : false
    }
  
    function getSol() {
        return solvable;
    }

    function solve(board) {
        winning_board = board;
        var initialNode = new Node(board, undefined, 0);
        var initialTwin = new Node(board.twin(), undefined, 0);
       
        var PQ = new MinPQ();
        var PQTwin = new MinPQ();
   
        PQ.insert(initialNode);
        PQTwin.insert(initialTwin);

        while (true) {
         
            var searchNode = PQ.delMin();
            var searchNodeTwin = PQTwin.delMin();
       
            if (searchNode.board.isGoal()) {
                this.isSolvable = true;
                this.steps = searchNode.steps;

                break;
            }
      
            if (searchNodeTwin.board.isGoal()) {
                this.isSolvable = false;
                winning_board = winning_board.twin();
                break;
            }
            
            addNeighbours(PQ, searchNode);
            addNeighbours(PQTwin, searchNodeTwin);
        }

        constructSolution.call(this, searchNode);
    }

    function constructSolution(node) {
        if (this.isSolvable) {
            var stack = [];
            stack.push(node.board);
            while (node.prev !== undefined) {
                node = node.prev;
                stack.push(node.board);
            }
            solution = stack.reverse();
        } else {
            solution = [];
        }
    }

    function addNeighbours(queue, node) {

        var neighbours = node.board.getNeighbours();
        neighbours.forEach(function (board, index) {
            var n = new Node(board, node, node.steps + 1);

            if (node.prev !== undefined) {
                if (!board.equals(node.prev.board)) {
                    queue.insert(n);
                }
            } else {
                queue.insert(n);
            }
        });
    }

    var s = {
        solve: solve,
        steps: 0,

        init: function (board) {
            this.solve(board);
        },
        getSolution: function () {
            return solution;
        },
        getWinningBlocks : function(){
            return winning_board.blocks;
        },
        isSolvable: false
    };

    return {
        create: function (board) {
            var t = Object.create(s);
            t.init(board);
            return t;
        }
    };

})();