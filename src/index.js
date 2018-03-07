const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const logger = require('./logger');
const { Message } = require('./mongoose');

//Error handling
process.on('uncaughtException', console.error);
process.on('unhandledRejection', (e) => { throw e });

app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).send('Internal error. Sorry');
});

io.set('transports', ['websocket']);

const nationRoom = (nationId) => `nation_${nationId}`;

/**
 * @desc Fetches messages of nation
 * @param {number} the id of the nation from smart contract
 */
app.get('/messages/:nation_id', (req, res) => {

    if(req.query.auth_token !== process.env.SOCKET_AUTH_TOKEN){
        return res
            .status(401)
            .send();
    }

    Message
        .find({room: nationRoom(req.params.nation_id)})
        .limit(100)
        .then(messages => {
            res.send(messages);
        })
        .catch(e => {
            throw e;
        });
});

//Configure socket.io
io
    .use(function(socket, next){
        if (socket.handshake.query && socket.handshake.query.token){
            //@todo this is not sooo good practice but it's ok for now.
            if(socket.handshake.query.token !== process.env.SOCKET_AUTH_TOKEN){
                logger.warn(`Wrong auth token`);
                return next(new Error(`Wrong auth token`));
            }
            return next();
        }
        logger.warn(`Wrong auth token`);
        next(new Error('Missing auth token'));
    })
    .on('connection', function(socket){

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
            m.userId = data.userId;
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

    })
    .on('error', logger.error);

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
});
