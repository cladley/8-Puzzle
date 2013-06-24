var slidePuzzle = slidePuzzle || {};


slidePuzzle.utilites = {
    flattenArray: function (arr) {
        return [].concat.apply([], arr);
    },
    shuffleArray: function (o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
};


function PuzzlePiece(xPos, yPos, current, height, width,img, row, col) {
    this.currentposition = current;
    this.winningPosition = current;
    this.xPos = xPos;
    this.yPos = yPos;
    this.height = height;
    this.width = width;
    this.row = row;
    this.col = col;

    var d = $('<div>', {
        css: {
            border : '1px solid black',
            height: height,
            width: width,
            backgroundImage : 'url(' + img.src + ')',
            backgroundPosition: "-" + xPos + "px" + " " + "-" + yPos + "px",
            position : 'absolute'
        }
    });

    if (current === 0)
        d.css('visibility', 'hidden');

    this.container = d;
    d.data("piece", this);
}

PuzzlePiece.prototype = {

    setPositions: function (x, y, do_animation) {
        this.xPos = x;
        this.yPos = y;

        if (do_animation) {
            this.container.animate({
                top: y,
                left: x
            }, 200);
        } else {
            this.container.css({
                top: y,
                left : x
            });
        }
    },
    addToBoard: function (board) {
        $(board).append(this.container);
    }

};



slidePuzzle.Game = (function ($) {

    var gameBoardContainer;
    var solver;
    var solution;
    var pieceWidth;
    var pieceHeight;
    var pieces = [];
    var blankPiece;
    var picture;
    var diff;

    var difficulty = {
        easy: 3,
        medium: 4,
        hard: 6,
        insane: 12,
        superinsane : 30

    };

    function init() {
        gameBoardContainer.css("visibility", "hidden");
        pieces = createPieces();
        pieces = shufflePieces(pieces);
        is_solvable(pieces);
        setupEventListener(gameBoardContainer, 'click');
        drawBoard(); 
    }

    function swap_property(property, item1, item2) {
        var temp = item1[property];
        item1[property] = item2[property];
        item2[property] = temp;
    }

    function swap_pieces(pieces, t1, t2) {
        var temp = pieces[t1.x][t1.y];
        pieces[t1.x][t1.y] = pieces[t2.x][t2.y];
        pieces[t2.x][t2.y] = temp;
    }

    function is_solvable(pieces){
         var blocks = getBoardArray();
         var board = new Board(blocks);
         solution = Solver.create(board);
        // Since it isn't solvable, then we just two adjacent tiles that aren't blank
        // which makes it solvable
         if (!solution.isSolvable) {

             var tiles = board.tiles_swapped();
             var t1 = tiles.tile_1;
             var t2 = tiles.tile_2;

             var tile1 = pieces[t1.x][t1.y];
             var tile2 = pieces[t2.x][t2.y];

             swap_property("xPos", tile1, tile2);
             swap_property("yPos", tile1, tile2);
             swap_property("row", tile1, tile2);
             swap_property("col", tile1, tile2);
             swap_property("currentposition", tile1, tile2);
             swap_pieces(pieces, t1, t2);
             
         }
         return pieces;
         
    }
    function handleClick() {
        var piece = $(this).data("piece");
        try_move(piece);
    }

    function setupEventListener(element, event) {
        if(element)
            element.on(event, "div", handleClick);

    }
    function removeEventListener(element, event) {
        if(element)
            element.off(event, "div", handleClick);
    }
    
    function move(piece) {

        var pieceX = piece.xPos;
        var pieceY= piece.yPos;
        var piecePos = piece.currentposition;
        var pieceRow = piece.row;
        var pieceCol = piece.col;

        // Keep the array in sync with the board so that the 
        // solver can use it
        pieces[pieceRow][pieceCol] = blankPiece;
        pieces[blankPiece.row][blankPiece.col] = piece;

        piece.setPositions(blankPiece.xPos, blankPiece.yPos, true);
        piece.currentposition = blankPiece.currentposition;
        piece.row = blankPiece.row;
        piece.col = blankPiece.col;

        blankPiece.setPositions(pieceX, pieceY);
        blankPiece.currentposition = piecePos;
        blankPiece.row = pieceRow;
        blankPiece.col = pieceCol;

    }

    function try_move(piece) {

        if (is_valid(piece))
            move(piece);
        else
            console.log("I can't move");

        function is_valid(piece) {
            var moves = [
                [piece.row, piece.col + 1],
                [piece.row, piece.col - 1],
                [piece.row + 1, piece.col],
                [piece.row - 1, piece.col]
            ];

            var blankPositions = [blankPiece.row, blankPiece.col];
            var result = moves.filter(function (item, index) {
                return item[0] === blankPositions[0] && item[1] === blankPositions[1];
            });
            return result.length > 0;
        }     
    }

    function createPieces() {
        var ps = [];
        pieceWidth = picture.width / diff;
        pieceHeight = picture.height / diff;
        var numPieces = diff * diff;
        var posX;
        var posY;
        var currPos;
        var counter = 0;
        var temp;

        for (var y = 0; y < diff; y++) {
            temp = [];
            posY = pieceHeight * y;
            for (var x = 0; x < diff; x++) {
                posX = pieceWidth * x;
                currPos = ++counter < numPieces ? counter : 0;
                var p = new PuzzlePiece(posX, posY, currPos, pieceHeight, pieceWidth, picture);
                if (currPos === 0) blankPiece = p;

                temp.push(p);
            }
            pieces.push(temp);
        }
        return pieces;
    }

    function shufflePieces(arr) {
        var flat = slidePuzzle.utilites.flattenArray(arr);    
        var shuffled = slidePuzzle.utilites.shuffleArray(flat);
        
        var temp = [];
        var counter = 0;
        for (var i = 0; i < diff; i++) {
            var row = [];
            for (var k = 0; k < diff; k++) {
                // Get each piece from shuffled array and update
                // its currentpostion since the array has been shuffled
                var piece = shuffled[counter++];
                piece.row = i;
                piece.col = k;
                piece.currentposition = counter;
                row.push(piece);
            }
            temp.push(row);
        }
        return temp;
    }

  
    function drawBoard() {
        if (!gameBoardContainer)
            throw "Need a container to draw board";

        var counter = 1;

        for (var i = 0; i < diff; i++) {
            var y = pieceHeight * i;
            for (var j = 0; j < diff; j++) {
                var p = pieces[i][j];
                var x = pieceWidth * j;
                p.setPositions(x, y);
                p.addToBoard(gameBoardContainer);
            }

        }

    }

    function drawToConsole() {
        var s = "";

        for (var i = 0; i < diff; i++){
            for (var k = 0; k < diff; k++) {
                s += pieces[i][k].winningPosition + ", ";
            }
            s += "\n";
        }
        console.log(s);

    }

    function getBoardArray () {
                var board = [];
                for (var i = 0; i < diff; i++) {
                    var temp = []
                    for (var k = 0; k < diff; k++) {
                        temp.push(pieces[i][k].winningPosition);
                    }
                    board.push(temp);
                }
                return board;
    }

    function newGame(container, img_url, dif) {
      
        diff = difficulty[dif] || 3; // easy : 3
        gameBoardContainer = container;
        try {
       
            picture = new Image();
            picture.src = img_url;
            picture.onload = function () {

                init();
            }

        } catch (e) {
            console.log("Something went wrong loading the image");
            throw e;
        }

        return {

            getSinglePiece : function(){
                return pieces[0][0];
            },

            movePosition : function(row,col){
                $(pieces[row][col].container).trigger('click');
            },

            getBoardArray: function () {
                var board = [];
                for (var i = 0; i < diff; i++) {
                    var temp = []
                    for (var k = 0; k < diff; k++) {
                        temp.push(pieces[i][k].winningPosition);
                    }
                    board.push(temp);
                }
                return board;
            },
            showBoard : function(){
                gameBoardContainer.css("visibility", "visible");
            },
            destroy: function () {
                removeEventListener(gameBoardContainer, 'click');
                gameBoardContainer.empty();
                gameBoardContainer = null;
                solver = null;
                solution = null;
                pieceWidth = null;
                pieceHeight = null;
                pieces = [];
                blankPiece = null;
                picture = null;
                diff = null;

            }

        };
    }

    
    return {
        newGame: function (container, img, difficulty) {
            return newGame(container, img, difficulty);
        },
      
    }


})(jQuery);