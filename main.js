function queue(funcs, delay) {
    var i;
    var o;

    setTimeout(function run() {
        o = funcs.shift();
        if (o !== undefined) {
            o.fnc(o.args[0], o.args[1]);
            setTimeout(run, delay);
        }
    }, delay);

}

var overlay = new Overlay({});
var $game_board = $('#game_board');
var game;


$('p.pic').on('click', function (e) {

    if (game) {
        game.destroy();
        game = null;
    }
    $('p.pic').removeClass('selected');
    $(this).addClass('selected');

    //if (overlay.isVisible()) {
    //    overlay.hide();
    //}

    var img = this.children[0];
    var pic_url = img.getAttribute("src");

    overlay.load_img(pic_url);
    overlay.show(true);

    setTimeout(function () {
        game = slidePuzzle.Game.newGame($game_board, pic_url, 'easy');
    }, 300)

});


$('#btnScramble').on('click', function () {
    var pic_url = overlay.get_image_url();
    overlay.hide(true);
    game.showBoard();
});


$('#solve').on('click', function () {
    var blocks = game.getBoardArray();
    var board = new Board(blocks);
    var solution = Solver.create(board);
    // Should always be solvable by the way we have set it up.
    if (solution.isSolvable) {
        var q = [];
        var boards = solution.getSolution();

        for (var i = 0; i < boards.length; i++) {
            boards[i].printBoard();
            if (boards[i].move !== undefined) {
                q.push({ fnc: game.movePosition, args: [boards[i].move[0], boards[i].move[1]] })
            }
        }

        queue(q, 200);
    } else {
        console.log("No solution found");
    }
});