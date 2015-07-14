$(document).ready(function() {
    var nickname = "";
    var typing = false;
    var usersTyping = [];

    // ===== Initialise page =====
    $('form#nicknamebox').show();

    // ===== Socket.IO =====
    var socket = io();

    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg.nick + ": " + msg.text));
    });

    socket.on('user connected', function() {
        $('#messages').append($('<li>', {
            class: 'info'
        }).text('A user has connected!'));
    });

    socket.on('login', function(nick) {
        $('#messages').append($('<li>', {
            class: 'info'
        }).text(nick + ' has joined the chat!'));
    });

    socket.on('user disconnected', function(nick) {
        if (nick != "") {
            userNotTyping(nick);
            updateUsersTyping();
            $('#messages').append($('<li>', {
                class: 'info'
            }).text(nick + ' has disconnected!'));
        } else {
            $('#messages').append($('<li>', {
                class: 'info'
            }).text('A user has disconnected!'));
        }
    });

    socket.on('login success', function() {
        $('form#nicknamebox').hide();
        $('form#messagebox').show();
    });

    socket.on('nickname exists', function() {
        $('#nickname').attr('placeholder', 'Someone has that nickname... Another!')
        $('#nickname').val('');
    });

    socket.on('typing', function(typ) {
        if (typ.typing) {
            usersTyping.push(typ.nickname);
        } else {
            userNotTyping(typ.nickname);
        }
        updateUsersTyping();
    });

    // ===== jQuery =====
    $('form#messagebox').submit(function() {
        message = $('#m').val();
        socket.emit('chat message', {
            text: message,
            nick: nickname
        });
        $('#messages').append($('<li>').text(nickname + ": " + message));
        $('#m').val('');
        return false;
    });

    $('form#nicknamebox').submit(function() {
        nickname = $('#nickname').val();
        socket.emit('login', nickname);
        return false;
    });

    $('#m').on('input', function() {
        if ($(this).val().length === 0) {
            if (typing) {
                socket.emit('typing', false);
            }
            typing = false;
        } else {
            if (!typing) {
                socket.emit('typing', true);
            }
            typing = true;
        }
    });

    // ===== Helper =====
    var userNotTyping = function(nick) {
        i = usersTyping.indexOf(nick);
        usersTyping.splice(i, 1);
    };

    var updateUsersTyping = function() {
        if (usersTyping.length == 0)
            text = "";
        else {
            text = "Users currently typing: ";
            for (i = 0; i < usersTyping.length; i++) {
                text = text + usersTyping[i] + " ";
            }
        }
        $('#typing').text(text);
    }
});