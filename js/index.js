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
        scrollToBottom();
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
        $('#users').append($('<li>', {
            id: nick
        }).text(nick));
    });

    socket.on('user disconnected', function(nick) {
        if (nick != "") {
            userNotTyping(nick);
            updateUsersTyping();
            $('#messages').append($('<li>', {
                class: 'info'
            }).text(nick + ' has disconnected!'));
            $('#users li#' + nick).remove();
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

    socket.on('user list', function(users) {
        for (i = 0; i < users.length; i++) {
            $('#users').append($('<li>', {
                id: users[i]
            }).text(users[i]));
        }
    });

    // ===== jQuery =====
    $('form#messagebox').submit(function() {
        if ($('#m').val().length > 0) {
            message = $('#m').val();
            socket.emit('chat message', {
                text: message,
                nick: nickname
            });
            $('#messages').append($('<li>').text(nickname + ": " + message));
            $('#m').val('').trigger('input');
            scrollToBottom();
        }
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
        if (i != -1)
            usersTyping.splice(i, 1);
    };

    var updateUsersTyping = function() {
        if (usersTyping.length == 0)
            $('#typing').hide();
        else {

            text = "Users currently typing: ";
            for (i = 0; i < usersTyping.length; i++) {
                if (i != 0)
                    text = text + ", ";
                text = text + usersTyping[i];
            }
            $('#typing').text(text).show();
        }
    }

    var scrollToBottom = function() {
        $('html, body').scrollTop($(document).height() - $(window).height());
    };
});