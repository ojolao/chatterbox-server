var app = {
  server: '127.0.0.1:3000/classes/messages',
  
};
app.$roomSelect = $('#roomSelect');
app.messages;
app.friends = {};
app.rooms = new Set();
app.currentRoom = 'lobby';
app.init = function() { 
  app.$roomSelect = $('#roomSelect');
  
  // What happens on send
  $('#send').submit(app.handleSubmit);

/*  setInterval(function() {
    app.clearMessages();
    app.fetch();
  }, 15000); //how to get it to not blink?*/

  // What happens when a user selects a room
  $('#roomSelect').on('change', function() {

    var selectIndex = app.$roomSelect.prop('selectedIndex');

    // Create new room option
    if (selectIndex === 0) {
      var roomname = prompt('Enter new room name');
      if (roomname) {
        app.currentRoom = roomname;

        app.renderRoom(roomname);

        app.$roomSelect.val(roomname);
      }
    } else {
      app.currentRoom = app.$roomSelect.val();      
    }

    app.renderMessages(app.messages);
  });
  
  $('#chats').on('click', '.username', app.handleUsernameClick);

  app.fetch();
};
app.send = function (message) {
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      $('#message').val('');

      app.fetch();
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function () {
  $.ajax({
    url: app.server + '?order=-createdAt', 
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: chats received');
      //console.log(data.results);
      app.messages = data.results;

      var mostRecentMessage = data.results[data.results.length - 1];

      // If there's new messages, re-render all messages and re-render room list
      if (app.lastMessageId !== mostRecentMessage.objectId) {

        // Adds each room in our room collection to <select> as options
        app.renderRoomList(app.messages);
        
        // For each message, filter messages for roomname
        app.renderMessages(app.messages);
        
        // Reassign last message id
        app.lastMessageId = mostRecentMessage.objectId;
      }
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receive chats', data);
    }
  });
};

app.renderRoomList = function(messages) {
  // 
  app.$roomSelect.html('<option value="__newRoom">New Room...</option>');
  if (messages) {
    var rooms = {};

    messages.forEach(function(message) {
      var roomname = message.roomname;
      if (roomname && !rooms[roomname]) {
        app.renderRoom(roomname);

        rooms[roomname] = true;
      }

    });
  }
};

// Puts a room into the <select>
app.renderRoom = function(roomname) {

  var $option = $('<option/>').val(roomname).text(roomname);
  // Add to select
  app.$roomSelect.append($option);
};

app.clearMessages = function() {
  $('#chats').html('');
};

app.renderMessages = function(messages) {
  // Clear messages
  app.clearMessages();

  // render all messages that are in the current room
  messages.filter(function(message) {
    return message.roomname === app.currentRoom ||
      app.currentRoom === 'lobby' && !message.roomname;
  }).forEach(app.renderMessage);
};

/*app.renderMessage = function (messageObj) {
  var escapeHtml = function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  };
  var escapedText = escapeHtml(messageObj.text);
  var escapedUsername = escapeHtml(messageObj.username);
  $('#chats').append(`<div><span class='username' onClick="app.handleUsernameClick()">${escapedUsername}</span>: ${escapedText}</div>`);
};*/

app.renderMessage = function (message) {
  if (!message.roomname) {
    message.roomname = 'lobby';
  }

  var $chat = $('<div class="chat"/>');

  // add message to DOM
  var $username = $('<span class="username"/>');
  $username.text(message.username + ': ').attr('data-roomname', message.roomname).attr('data-username', message.username).appendTo($chat);

  if (app.friends[message.username] === true) {
    $username.addClass('friend');
  }

  var $message = $('<br><span/>');
  $message.text(message.text).appendTo($chat);

  $('#chats').append($chat);
};

app.handleUsernameClick = function(event) {
  var username = $(event.target).data('username');

  if (username !== undefined) {
    // toggle friend
    app.friends[username] = !app.friends[username];

    var selector = '[data-username="' + username.replace(/"/g, '\\\"') + '"]';

    var $usernames = $(selector).toggleClass('friend');
  }
};

app.handleSubmit = function(event) {
  var message = {
    roomname: app.currentRoom,
    username: window.location.search.slice(10), //should we escape the username for server security?
    text: $('#message').val()
  };

  app.send(message);

  event.preventDefault();
};

$(document).ready(function() {
  app.init();
});