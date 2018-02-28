const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const logger = require('./logger');
const { Message } = require('./mongoose');

//Error handling
process.on('uncaughtException', console.error);
process.on('unhandledRejection', (e) => { throw e });

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal error. Sorry');
});

io.set('transports', ['websocket']);

//Configure socket.io
io
    .on('connection', function(socket){

        const nationRoom = (nationId) => `nation_${nationId}`;

        /**
         * @desc join room. Will inform the client when joined.
         */
        socket.on('room:join', (data) => {
            //Join the room
            socket.join(`room:${nationRoom(data.nation_id)}`);
            //tell client that he joined
            socket.emit('room:joined', data);
        });

        /**
         * @desc broadcast message ot room
         */
        socket.on('room:msg', (data) => {

            //Save message
            const m = new Message();
            m.room = nationRoom(data.nation_id);
            m.msg= data.msg;
            m.from = data.from;
            m.createdAt = new Date();
            m
                .save()
                //Emit message in room
                .then((msg) => io.sockets.in(`room:${nationRoom(data.nation_id)}`).emit('msg', msg))
                .catch(e => { throw e });

        });

        /**
         * @desc leave nation chat
         */
        socket.on('room:leave', (data) => {
            socket.leave(`room:nation_${data.nation_id}`, () => {
                socket.emit(`room:left`, data)
            })
        })

    });

http.listen(3000, function(){
    console.log('listening on *:3000');
});