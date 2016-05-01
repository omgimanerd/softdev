/**
 * Class encapsulating the client side of the game, handles drawing and
 * updates.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)


/**
 * Creates a game on the client side to manage and render the players,
 * projectiles, and powerups.
 * @constructor
 * @param {Object} socket The socket connected to the server.
 * @param {Drawing} drawing The Drawing object that will render the game.
 * @param {ViewPort} viewPort The ViewPort object that will manage the
 *   player's view of the entities.
 */
function Game(socket, drawing, viewPort) {
  this.socket = socket;
  this.drawing = drawing;
  this.viewPort = viewPort;

  this.animationFrameId = null;

  this.self = null;
  this.players = [];
  this.bombs = [];
}

/**
 * Factory method for the Game class.
 * @param {Object} socket The socket connected to the server.
 * @param {Element} canvasElement The HTML5 canvas to render the game on.
 * @return {Game}
 */
Game.create = function(socket, canvasElement) {
  canvasElement.width = Constants.CANVAS_WIDTH;
  canvasElement.height = Constants.CANVAS_HEIGHT;
  var canvasContext = canvasElement.getContext('2d');

  var drawing = Drawing.create(canvasContext);
  var viewPort = new ViewPort();

  return new Game(socket, drawing, viewPort);
};

/**
 * Initializes the game and sets the game to respond to update packets from the
 * server.
 */
Game.prototype.init = function() {
  var context = this;
  this.socket.on('update', function(data) {
    context.receiveGameState(data);
  });
  this.beginAnimation();
};

/**
 * Updates the game's internal storage of all the powerups, called each time
 * the server sends packets.
 * @param {Object} state The update packet sent by the server.
 */
Game.prototype.receiveGameState = function(state) {
  this.self = state['self'];
  this.players = state['players'];
  this.bombs = state['bombs'];
};

/**
 * This method begins the animation loop for the game.
 */
Game.prototype.beginAnimation = function() {
  this.animationFrameId = window.requestAnimationFrame(
      bind(this, this.update));
};

/**
 * Updates the state of the game client side and relays intents to the
 * server.
 */
Game.prototype.update = function() {
  if (this.self) {
    var selfX = this.self['x'];
    var selfY = this.self['y'];
    this.viewPort.update(selfX, selfY);

    var selfCoords = this.viewPort.toCanvasCoords(selfX, selfY);
    var mouseAngle = Math.atan2(
        selfCoords[1] - Input.MOUSE[1], selfCoords[0] - Input.MOUSE[0]);

    var packet = {
      'keyboardState': {
        'up': Input.UP,
        'down': Input.DOWN,
        'left': Input.LEFT,
        'right': Input.RIGHT
      },
      'mouseAngle': mouseAngle,
      'mouseCoords': this.viewPort.toWorldCoords(Input.MOUSE[0],
                                                 Input.MOUSE[1]),
      'mouseClick': Input.LEFT_CLICK
    };
    this.socket.emit('player-action', packet);
  }

  this.draw();

  this.animationFrameId = window.requestAnimationFrame(
      bind(this, this.update));
};

/**
 * Draws the state of the game onto the HTML5 canvas.
 */
Game.prototype.draw = function() {
  // Clear the canvas.
  this.drawing.clear();

  if (this.self) {
    this.drawing.drawTiles([this.self['x'], this.self['y']]);
    var selfCoords = this.viewPort.toCanvasCoords(
        this.self['x'], this.self['y']);
    this.drawing.drawPlayer(true, selfCoords, this.self['orientation'],
        this.self['hitboxSize'], this.self['health'], this.self['name']);
  }

  for (var i = 0; i < this.players.length; ++i) {
    var playerCoords = this.viewPort.toCanvasCoords(
        this.players[i]['x'], this.players[i]['y']);
    this.drawing.drawPlayer(false, playerCoords,
        this.players[i]['orientation'], this.players[i]['hitboxSize'],
        this.players[i]['health'], this.players[i]['name']);
  }

  for (var i = 0; i < this.bombs.length; ++i) {
    var bombCoords = this.viewPort.toCanvasCoords(
        this.bombs[i]['x'], this.bombs[i]['y']);
    this.drawing.drawBomb(bombCoords, this.bombs[i]['timer'],
        this.bombs[i]['hitboxSize']);

  }
};
