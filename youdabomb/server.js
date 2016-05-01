/**
 * This is the server app script that is run on the server.
 * @author Alvin Lin (alvin.lin.dev@gmail.com)
 */

// Constants
var DEV_MODE = false;
var FRAME_RATE = 1000.0 / 60.0;
var IP = process.env.IP || 'localhost';
var PORT_NUMBER = process.env.PORT || 5000;

// Sets the DEV_MODE constant during development if we run 'node server --dev'
process.argv.forEach(function(value, index, array) {
  if (value == '--dev' || value == '--development') {
    DEV_MODE = true;
  }
});

// Dependencies.
var express = require('express');
var http = require('http');
var morgan = require('morgan');
var socketIO = require('socket.io');
var swig = require('swig');

var Game = require('./lib/Game');

// Initialization.
var app = express();
var server = http.Server(app);
var io = socketIO(server);

var game = Game.create();

app.engine('html', swig.renderFile);

app.set('port', PORT_NUMBER);
app.set('view engine', 'html');

app.use(morgan(':date[web] :method :url :req[header] :remote-addr :status'));
app.use('/public',
        express.static(__dirname + '/public'));
app.use('/shared',
        express.static(__dirname + '/shared'));

// Routing
app.get('/', function(request, response) {
  response.render('index.html', {
    dev_mode: DEV_MODE
  });
});

app.get('/test', function(request, response) {
  response.render('test.html', {
    dev_mode: DEV_MODE
  });
});

/**
 * Server side input handler, modifies the state of the players and the
 * game based on the input it receives. Everything runs asynchronously with
 * the game loop.
 */
io.on('connection', function(socket) {
  // When a new player joins, the server adds a new player to the game.
  socket.on('new-player', function(data, callback) {
    game.addNewPlayer(data.name, socket);
    callback(true);
  });

  socket.on('player-action', function(data) {
    game.updatePlayerOnInput(socket.id, data.keyboardState, data.mouseAngle,
                             data.mouseCoords, data.mouseClick);
  });

  // When a player disconnects, remove them from the game.
  socket.on('disconnect', function() {
    game.removePlayer(socket.id);
  });
});

/**
 * This starts the server side game loop at the specified framerate.
 */
setInterval(function() {
  game.update();
  game.sendState();
}, FRAME_RATE);

/**
 * This starts the server and sets the port and mode.
 */
server.listen(PORT_NUMBER, function() {
  console.log('STARTING SERVER ON PORT ' + PORT_NUMBER);
  if (DEV_MODE) {
    console.log('DEVELOPMENT MODE ENABLED: SERVING UNCOMPILED JAVASCRIPT!');
  }
});
