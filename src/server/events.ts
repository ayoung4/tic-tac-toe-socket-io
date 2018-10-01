import * as shortid from 'shortid'

import { SocketEvents } from 'Shared/constants';

export const createGame = (socket) => (data) => {
    const gameId = shortid.generate();
    socket.join(gameId);
    socket.emit('newGame', {
        name: data.name,
        room: gameId,
    });
};

export const joinGame = (socket, io) => (data) => {
    var room = io.nsps['/'].adapter.rooms[data.room];
    if (room && room.length === 1) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit(SocketEvents.PLAYER_1, {});
        socket.emit(SocketEvents.PLAYER_2, { name: data.name, room: data.room })
    } else {
        socket.emit(SocketEvents.ERR, { message: 'Sorry, The room is full!' });
    }
}

export const playTurn = (socket) => (data) => {
    socket.broadcast.to(data.room).emit(SocketEvents.TURN_PLAYED, {
        tile: data.tile,
        room: data.room
    });
}

export const gameEnded = (socket) => (data) => {
    socket.broadcast.to(data.room).emit(SocketEvents.GAME_END, data);
}