var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var users = {};
var numUsers = 0;

io.on('connection', function(socket){
    socket.broadcast.emit('logon message', 'new user connected.');
    var user_id = users.count + 1;

    socket.on('chat message', function(message){
        var data = [socket.nickname, message];
        socket.broadcast.emit('chat message', data);
    });

    socket.on('set nickname', function(nickname){
        previous = socket.nickname ? socket.nickname : 'Anonymous';
        socket.nickname = nickname;
        users[nickname] = nickname;
        ++numUsers;
        var data = {
            'previous': previous,
            'new': nickname
        }
        socket.broadcast.emit('nickname change', data);
    });

    socket.on('disconnect', function(){
        socket.broadcast.emit('logoff message', 'user disconnected.');
    });
});

http.listen(port, function(){
    console.log("listening on *" + port);
});
