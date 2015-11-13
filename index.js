var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.broadcast.emit('logon message', 'new user connected.');

    socket.on('chat message', function(message){
        var data = [get_nickname(), message];
        io.emit('chat message', data);
    });

    socket.on('set nickname', function(nickname){
        previous = get_nickname();
        socket.nickname = nickname;
        var data = {
            'previous': previous,
            'new': nickname
        }
        io.emit('nickname change', data);
    });

    socket.on('disconnect', function(){
        socket.broadcast.emit('logoff message', 'user disconnected.');
    });

    function get_nickname(){
        if(!socket.nickname) {
            return 'Anonymous';
        } else {
            return socket.nickname;
        }
    }
});

http.listen(port, function(){
    console.log("listening on *" + port);
});
