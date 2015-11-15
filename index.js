var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var last_user_id = 0;
var users = {
    'total': 0
};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    users['total'] = users['total'] + 1;
    io.emit('connect message', users);

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
        socket.broadcast.emit('nickname change', data);
    });

    socket.on('disconnect', function(){
        users['total'] = users['total'] - 1;
        io.emit('disconnect', users);
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
