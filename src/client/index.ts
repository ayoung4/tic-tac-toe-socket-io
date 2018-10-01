import * as $ from 'jquery';
import * as connect from 'socket.io-client';

import { Player } from 'Shared/engine/player';
import { Game } from 'Shared/engine/game';
import { SocketEvents } from 'Shared/constants';

const displayBoard = (message) => {
    $('.menu').css('display', 'none');
    $('.gameBoard').css('display', 'block');
    $('#userHello').html(message);
    $('#turn').text('Waiting for Opponent');
}

(function init() {
    const P1 = 'X';
    const P2 = 'O';
    let player: Player;
    let game: Game;

    const socket = connect('http://localhost:5000');

    function tileClickHandler() {
        const row = parseInt(this.id.split('_')[1][0], 10);
        const col = parseInt(this.id.split('_')[1][1], 10);
        console.log(player, game);
        
        if (!player.getCurrentTurn() || !game) {
            alert('Its not your turn!');
            return;
        }

        if ($(this).prop('disabled')) {
            alert('This tile has already been played on!');
            return;
        }

        // Update board after your turn.
        game.playTurn($(this).attr('id'));
        game.updateBoard(player.getPlayerType(), row, col);
        $(`#${this.id}`).text(player.getPlayerType()).prop('disabled', true);

        player.setCurrentTurn(false);
        player.updatePlaysArr(1 << ((row * 3) + col));

        game.checkWinner(player);
    };

    // Create a new game. Emit newGame event.
    $('#new').on('click', () => {
        const name = $('#nameNew').val();
        if (!name) {
            alert('Please enter your name.');
            return;
        }
        socket.emit(SocketEvents.CREATE_GAME, { name });
        player = new Player(name, P1);
    });

    // Join an existing game on the entered roomId. Emit the joinGame event.
    $('#join').on('click', () => {
        const name = $('#nameJoin').val();
        const roomID = $('#room').val();
        if (!name || !roomID) {
            alert('Please enter your name and game ID.');
            return;
        }
        socket.emit(SocketEvents.JOIN_GAME, { name, room: roomID });
        player = new Player(name, P2);
    });

    // New Game created by current client. Update the UI and create new Game var.
    socket.on('newGame', (data) => {
        const message =
            `Hello, ${data.name}. Please ask your friend to enter Game ID: 
        ${data.room}. Waiting for player 2...`;

        // Create game for player 1
        game = new Game(data.room, socket);
        displayBoard(message);
        game.createGameBoard();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                $(`#button_${i}${j}`).on('click', tileClickHandler);
            }
        }
    });

    /**
       * If player creates the game, he'll be P1(X) and has the first turn.
       * This event is received when opponent connects to the room.
       */
    socket.on(SocketEvents.PLAYER_1, (data) => {
        const message = `Hello, ${player.getPlayerName()}`;
        $('#userHello').html(message);
        player.setCurrentTurn(true);
        $('#turn').text('Your turn');
    });

    /**
       * Joined the game, so player is P2(O). 
       * This event is received when P2 successfully joins the game room. 
       */
    socket.on(SocketEvents.PLAYER_2, (data) => {
        const message = `Hello, ${data.name}`;

        // Create game for player 2
        game = new Game(data.room, socket);
        displayBoard(message);
        game.createGameBoard();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                $(`#button_${i}${j}`).on('click', tileClickHandler);
            }
        }
        player.setCurrentTurn(false);
    });

    /**
       * Opponent played his turn. Update UI.
       * Allow the current player to play now. 
       */
    socket.on(SocketEvents.TURN_PLAYED, (data) => {
        const row = data.tile.split('_')[1][0];
        const col = data.tile.split('_')[1][1];
        const opponentType = player.getPlayerType() === P1 ? P2 : P1;

        game.updateBoard(opponentType, row, col);
        $(`#${data.tile}`).text(opponentType).prop('disabled', true);

        player.setCurrentTurn(true);
    });

    // If the other player wins, this event is received. Notify user game has ended.
    socket.on(SocketEvents.GAME_END, (data) => {
        game.endGame(data.message);
        socket.disconnect();
    });

    /**
       * End the game on any err event. 
       */
    socket.on(SocketEvents.ERR, (data) => {
        game.endGame(data.message);
    });
}());
