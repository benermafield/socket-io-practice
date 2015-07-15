var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/css/index.css', function(req, res) {
	res.sendFile(__dirname + '/css/index.css');
});

app.get('/js/index.js', function(req, res) {
	res.sendFile(__dirname + '/js/index.js');
});

io.on('connection', function(socket) {
	io.emit('user connected');
	socket.emit('user list', Object.keys(users))
	socket.nickname = "";

	socket.on('disconnect', function() {
		if (socket.nickname != "") {
			delete users[socket.nickname];
		}
		io.emit('user disconnected', socket.nickname);
	});

	socket.on('login', function(nick) {
		if (nick in users) {
			socket.emit('nickname exists');
		} else {
			socket.nickname = nick;
			users[socket.nickname] = socket.id;
			socket.emit('login success');
			io.emit('login', nick);
		}
	});

	socket.on('chat message', function(msg) {
		socket.broadcast.emit('chat message', msg);
	});

	socket.on('typing', function(typ) {
		socket.broadcast.emit('typing', {
			nickname: socket.nickname,
			typing: typ
		})
	});
});

http.listen(process.env.PORT || 3000, function() {
	console.log('listening on *:3000');
});