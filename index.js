var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

var last_user_id = 0;
var users = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


function generate_guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

io.on('connection', function(socket){
    var nickname = 'Anonymous';
    var guid = generate_guid();

    io.emit('connect message', users);

    socket.on('register user', function(data){
        users[guid] = data['nickname'];
    });

    socket.on('chat message', function(message){
        var data = [nickname, message];
        io.emit('chat message', data);
    });

    socket.on('set nickname', function(data){
        var previous = nickname;
        nickname = data['nickname'];

        users[guid] = nickname;
        var data = {
            'delta' : {
                'previous': previous,
                'new': nickname
            },
            'users' : users
        }
        socket.broadcast.emit('nickname change', data);
    });

    socket.on('disconnect', function(){
        io.emit('disconnect', users);
        var index = users.indexOf(guid);
        if (index > -1) {
            console.log('removing user...');
            users.splice(index, 1);
        }
    });

    function get_nickname(data){
        if(!data['nickname']) {
            return 'Anonymous';
        } else {
            return data['nickname'];
        }
    }
});

http.listen(port, function(){
    console.log("listening on *" + port);
});
