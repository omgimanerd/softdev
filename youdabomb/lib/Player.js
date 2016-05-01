/**
 * Stores the state of the player on the server. This class will also store
 * other important information such as socket ID, packet number, and latency.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

var Entity = require('./Entity');
var Game = require('./Game');

var Constants = require('../shared/Constants');
var Util = require('../shared/Util');

/**
 * Constructor for a Player.
 * @constructor
 * @param {number} x The x-coordinate to generate the player at.
 * @param {number} y The y-coordinate to generate the player at.
 * @param {number} orientation The direction to face the player from
 *   0 to 2 * PI.
 * @param {string} name The display name of the player.
 * @param {string} id The socket ID of the client associated with this
 *   player.
 */
function Player(x, y, orientation, name, id) {
  this.x = x;
  this.y = y;
  this.orientation = orientation;
  this.name = name;
  this.id = id;

  this.health = Player.MAX_HEALTH;
  this.hitboxSize = Player.DEFAULT_HITBOX_SIZE;

  this.lastBombTime = 0;
  this.bombCooldown = Player.BOMB_COOLDOWN;

  this.deaths = 0;
}
require('../shared/inheritable');
Player.inheritsFrom(Entity);

/** @type {number} */
Player.MAX_HEALTH = 10;

/** @type {number} */
Player.DEFAULT_HITBOX_SIZE = 25;

/** @type {number} */
Player.MOVE_SPEED = 0.25;

/** @type {number} */
Player.BOMB_COOLDOWN = 750;

/**
 * Returns a new Player object given a name and id.
 * @param {string} name The display name of the player.
 * @param {string} id The socket ID of the client associated with this
 *   player.
 * @return {Player}
 */
Player.generateNewPlayer = function(name, id) {
  var padding = Constants.WORLD_PADDING;
  var point = [Util.randRange(Constants.WORLD_MIN + padding,
                              Constants.WORLD_MAX - padding),
               Util.randRange(Constants.WORLD_MIN + padding,
                              Constants.WORLD_MAX - padding)];
  var orientation = Util.randRange(0, 2 * Math.PI);
  return new Player(point[0], point[1], orientation, name, id);
};

/**
 * Updates this player given the the client's input states.
 * @param {Object} keyboardState A JSON Object storing the state of the
 *   client keyboard.
 * @param {number} mouseAngle The angle of the client's mouse with respect
 *   to the player.
 * @param {Array<number>} mouseCoords The coordinates of the players' mouse.
 * @param {boolean} mouseClick The state of the player's mouse click.
 * @param {function()} addBombCallback The callback function to call if
 *   the player threw a bomb.
 */
Player.prototype.updateOnInput = function(keyboardState, mouseAngle,
                                          mouseCoords, mouseClick,
                                          addBombCallback) {
  if (keyboardState.up) {
    this.vy = -Player.MOVE_SPEED;
  } else if (keyboardState.down) {
    this.vy = Player.MOVE_SPEED;
  } else {
    this.vy = 0;
  }

  if (keyboardState.left) {
    this.vx = -Player.MOVE_SPEED;
  } else if (keyboardState.right) {
    this.vx = Player.MOVE_SPEED;
  } else {
    this.vx = 0;
  }

  this.orientation = mouseAngle;

  if (mouseClick && this.canThrowBomb()) {
    addBombCallback(this.x, this.y, mouseCoords);
    this.lastBombTime = (new Date()).getTime();
  }
};

/**
 * Updates the player's position and powerup states, this runs in the 60Hz
 * server side loop so that powerups expire even when the player is not
 * moving or shooting.
 */
Player.prototype.update = function() {
  this.parent.update.call(this);

  var boundedCoord = [
    Util.bound(this.x, Constants.WORLD_MIN, Constants.WORLD_MAX),
    Util.bound(this.y, Constants.WORLD_MIN, Constants.WORLD_MAX)
  ];
  this.x = boundedCoord[0];
  this.y = boundedCoord[1];

  if (this.isDead()) {
    this.respawn();
  }
};

/**
 * This method returns true if the player's bomb cooldown has passed
 * and the player can throw a bomb.
 * @return {boolean}
 */
Player.prototype.canThrowBomb = function() {
  return (new Date()).getTime() > this.lastBombTime + this.bombCooldown;
};

/**
 * Returns a boolean determining if the player is dead or not.
 * @return {boolean}
 */
Player.prototype.isDead = function() {
  return this.health <= 0;
};

/**
 * Damages the player by the given amount, factoring in shields.
 * @param {number} amount The amount to damage the player by.
 */
Player.prototype.damage = function(amount) {
  this.health -= amount;
};

/**
 * Handles the respawning of the player when killed.
 */
Player.prototype.respawn = function() {
  var padding = Constants.WORLD_PADDING;
  var point = [Util.randRange(Constants.WORLD_MIN + padding,
                              Constants.WORLD_MAX - padding),
               Util.randRange(Constants.WORLD_MIN + padding,
                              Constants.WORLD_MAX - padding)];

  this.x = point[0];
  this.y = point[1];
  this.health = Player.MAX_HEALTH;
  this.deaths++;
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = Player;
