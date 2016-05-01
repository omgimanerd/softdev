/**
 * Client side script that initializes the game. This should be the only script
 * that depends on JQuery.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

var socket = io();
var game = Game.create(socket, document.getElementById('canvas'));

$(document).ready(function() {
  Input.applyEventHandlers();
  Input.addMouseTracker(document.getElementById('container'));

  $('#name-input').focus();

  $('#name-form').submit(function() {
    $('#name-submit-spinner').empty();
    $('#name-submit-spinner').append(
        $('<span>').addClass('fa fa-2x fa-spinner fa-pulse'));

    var name = $('#name-input').val();
    if (name != '' && name.length < 20) {
      /**
       * When we emit a new-player packet to the server, the server will
       * return true as an acknowledgment if the packet was successfully
       * received and the player was successfully added.
       */
      socket.emit('new-player', {
        name: name
      }, function(status) {
        if (status) {
          $('#name-prompt-container').remove();
          game.init();
        } else {
          window.alert('An error occurred. Please try again later.');
        }
        $('#name-submit-spinner').empty();
      });
    } else {
      window.alert('Your name cannot be blank or over 20 characters.');
      $('#name-submit-spinner').empty();
    }
    return false;
  });
});
