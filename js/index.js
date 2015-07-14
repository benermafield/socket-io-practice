var socket = io();

var nickname = "";

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

$(document).ready(function() {
    $('form#nicknamebox').show();
});