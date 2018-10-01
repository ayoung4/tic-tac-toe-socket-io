import { SocketEvents } from '../constants';
import { Player } from './player';

// roomId Id of the room in which the game is running on the server.
export class Game {
    roomId: string;
    board: any[];
    moves: number;
    socket: any;
    constructor(roomId, socket) {
        this.roomId = roomId;
        this.socket = socket;
        this.board = [];
        this.moves = 0;
    }

    // Create the Game board by attaching event listeners to the buttons.
    createGameBoard() {
        for (let i = 0; i < 3; i++) {
            this.board.push(['', '', '']);
        }
    }
    // Remove the menu from DOM, display the gameboard and greet the player.
    /**
     * Update game board UI
     *
     * @param {string} type Type of player(X or O)
     * @param {int} row Row in which move was played
     * @param {int} col Col in which move was played
     * @param {string} tile Id of the the that was clicked
     */
    updateBoard(type, row, col) {
        this.board[row][col] = type;
        this.moves++;
    }

    getRoomId() {
        return this.roomId;
    }

    // Send an update to the opponent to update their UI's tile
    playTurn(clickedTile) {
        // Emit an event to update other player that you've played your turn.
        this.socket.emit(SocketEvents.PLAY_TURN, {
            tile: clickedTile,
            room: this.getRoomId(),
        });
    }
    /**
     *
     * To determine a win condition, each square is "tagged" from left
     * to right, top to bottom, with successive powers of 2.  Each cell
     * thus represents an individual bit in a 9-bit string, and a
     * player's squares at any given time can be represented as a
     * unique 9-bit value. A winner can thus be easily determined by
     * checking whether the player's current 9 bits have covered any
     * of the eight "three-in-a-row" combinations.
     *
     *     273                 84
     *        \               /
     *          1 |   2 |   4  = 7
     *       -----+-----+-----
     *          8 |  16 |  32  = 56
     *       -----+-----+-----
     *         64 | 128 | 256  = 448
     *       =================
     *         73   146   292
     *
     *  We have these numbers in the Player.wins array and for the current
     *  player, we've stored this information in playsArr.
     */
    checkWinner(player) {
        const currentPlayerPositions = player.getPlaysArr();

        Player.wins.forEach((winningPosition) => {
            if ((winningPosition & currentPlayerPositions) === winningPosition) {
                this.announceWinner(player);
            }
        });

        const tieMessage = 'Game Tied :(';
        if (this.checkTie()) {
            this.socket.emit(SocketEvents.GAME_ENDED, {
                room: this.getRoomId(),
                message: tieMessage,
            });
            alert(tieMessage);
            location.reload();
        }
    }

    checkTie() {
        return this.moves >= 9;
    }

    // Announce the winner if the current client has won. 
    // Broadcast this on the room to let the opponent know.
    announceWinner(player) {
        const message = `${player.getPlayerName()} wins!`;
        this.socket.emit(SocketEvents.GAME_ENDED, {
            room: this.getRoomId(),
            message,
        });
        alert(message);
        location.reload();
    }

    // End the game if the other player won.
    endGame(message) {
        alert(message);
        location.reload();
    }
}