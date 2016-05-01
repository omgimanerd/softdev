/**
 * Methods for drawing all the sprites onto the HTML5 canvas.
 */

/**
 * Creates a Drawing object.
 * @param {CanvasRenderingContext2D} context The context this object will
 *   draw to.
 * @param {Object} images The initialized image objects.
 * @constructor
 */
function Drawing(context, images) {
  this.context = context;

  this.images = images;
}

/** @type {string} */
Drawing.TEXT_FONT = '20px Arial';

/** @type {string} */
Drawing.TEXT_COLOR = 'black';

/** @type {string} */
Drawing.BASE_IMG_URL = '/public/img/';

/** @type {Object} */
Drawing.IMG_SRCS = {
  'self_player': Drawing.BASE_IMG_URL + 'self_player.png',
  'other_player': Drawing.BASE_IMG_URL + 'other_player.png',
  'bomb': Drawing.BASE_IMG_URL + 'bomb.png',
  'tile': Drawing.BASE_IMG_URL + 'tile.png'
};

/**
 * Factory method for creating a Drawing object.
 * @param {CanvasRenderingContext2D} context The context this object will
 *   draw to.
 * @return {Drawing}
 */
Drawing.create = function(context) {
  var images = {};
  for (var key in Drawing.IMG_SRCS) {
    images[key] = new Image();
    images[key].src = Drawing.IMG_SRCS[key];
  }
  return new Drawing(context, images);
};

/**
 * Draws a player to the canvas
 * @param {boolean} isSelf Tells if I should draw self or another player
 * @param {Array<number>} coords coordinates of player
 * @param {number} orientation that player is facing in
 * @param {number} hitbox size of player
 * @param {number} health of player
 * @param {string} name of player
 */
Drawing.prototype.drawPlayer = function(isSelf, coords, orientation, hitbox,
                                        health, name) {
  var x = coords[0];
  var y = coords[1];
  var player = null;
  if (isSelf) {
    player = this.images['self_player'];
  } else {
    player = this.images['other_player'];
  }
  this.context.save();
  this.context.translate(x, y);
  this.context.rotate(orientation - Math.PI / 2);
  this.context.drawImage(player, -hitbox, -hitbox, 2 * hitbox, 2 * hitbox);
  this.context.restore();

  this.context.save();
  this.context.translate(coords[0], coords[1]);
  for (var i = 0; i < 10; i++) {
    if (i < health) {
      this.context.fillStyle = 'green';
      this.context.fillRect(-25 + 5 * i, -42, 5, 4);
    } else {
      this.context.fillStyle = 'red';
      this.context.fillRect(-25 + 5 * i, -42, 5, 4);
    }
  }
  this.context.restore();

  this.context.save();
  this.context.translate(x, y);
  this.context.textAlign = 'center';
  this.context.font = Drawing.TEXT_FONT;
  this.context.fillStyle = Drawing.TEXT_COLOR;
  this.context.fillText(name, 0, -50);
  this.context.restore();
};

/**
 * Draws a bomb to the canvas
 * @param {Array<number>} coords coordinates of bomb
 * @param {string} timer on bomb (seconds)
 * @param {number} hitbox size of bomb
 */
Drawing.prototype.drawBomb = function(coords, timer, hitbox) {
  var x = coords[0];
  var y = coords[1];
  var bomb = this.images['bomb'];
  this.context.save();
  this.context.translate(x, y);
  this.context.drawImage(bomb, -hitbox, -hitbox, 2 * hitbox, 2 * hitbox);
  this.context.restore();

  this.context.save();
  this.context.translate(x, y);
  this.context.textAlign = 'center';
  this.context.font = Drawing.TEXT_FONT;
  this.context.fillStyle = 'red';
  this.context.fillText(timer, -5, 10);
  this.context.restore();
};

/**
 * Draws all tiles to the screen
 * @param {Array<number>} coords absolute coords of self_player
 */
Drawing.prototype.drawTiles = function(coords) {
  var x = coords[0] - Constants.CANVAS_WIDTH / 2;
  var y = coords[1] - Constants.CANVAS_HEIGHT / 2;

  this.context.save();

  var tile = this.images['tile'];
  for (var i = 0; i < Constants.WORLD_MAX; i += 100) {
    for (var j = 0; j < Constants.WORLD_MAX; j += 100) {
      this.context.drawImage(tile, i - x, j - y, 100, 100);
    }
  }

  this.context.restore();
};

/**
 * Clears the canvas.
 */
Drawing.prototype.clear = function() {
  this.context.clearRect(0, 0,
      Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);
};
