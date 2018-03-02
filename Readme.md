## Bitnation Chat Backend*
> This is a centralized version of our chat backend. WE DON'T SAVE ANY PRIVATE DATA. 

### How to use

Get the socket.io client. 

Connect like this to the socket.io server:
```js
const connection = io('SERVER_URL', {
    transports: ['websocket'], 
    upgrade: false, 
    query: 'token=' + 'THE_AUTH_TOKEN'
});
```


And use it like this to send / receive messages
```js

//All call's on the connection should be executed only when you are connected to the socket
connection.on('connect', () => {
    
    //Use this to join a room
    connection.emit('room:join', {
        nation_id: 1
    });
    
    //Every time you joined a room, this will be emitted
    connection.on('room:joined', (data) => {
        
        //data.nation_id can be used to check if you really joined the room your tried to join
        connection.emit('room:msg', {
            nation_id: 1,
            msg: 'hi',
            from: 'florian'
        });
        
        //Will be emitted if there is a message
        connection.on('msg', (messageData) => {
            
        })
        
    });
    
});
```

You can fetch the last 100 messages by calling `/messages/$smart_contract_nation_id` on the websocket server. Don't forget to at `auth_token` to the query parameters it's should be the same auth token as the one used for the socket authentication.