import * as express from 'express';
import * as path from 'path';
import * as http from 'http';
import * as socketIO from 'socket.io';

import * as events from './events';
import { SocketEvents } from 'Shared/constants';

const app = express();

const server = new http.Server(app);
const io = socketIO(server);

app.use(express.static(__dirname + '/public/'));

io.on('connection', (socket) => {

    socket.on(SocketEvents.CREATE_GAME, events.createGame(socket));

    socket.on(SocketEvents.JOIN_GAME, events.joinGame(socket, io));

    socket.on(SocketEvents.PLAY_TURN, events.playTurn(socket));

    socket.on(SocketEvents.GAME_ENDED, events.gameEnded(socket));

});

server.listen(5000);