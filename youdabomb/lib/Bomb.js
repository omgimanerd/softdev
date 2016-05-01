/**
 * @fileoverview This is a class encapsulating a bomb on the server side.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

var Entity = require('./Entity');

var Constants = require('../shared/Constants');
var Util = require('../shared/Util');

/**
 * Constructor for a Bomb.
 * @param {type} x The x coordinate to create the bomb at.
 * @param {type} y The y coordinate to create the bomb at.
 * @param {type} timer The timer to how long it will take for the bomb to
 *   explode.
 * @param {Array<number>} targetLocation The location that this bomb was
 *   thrown to by a player.
 * @constructor
 * @extends {Entity}
 */
function Bomb(x, y, timer, targetLocation) {
  this.x = x;
  this.y = y;

  this.timer = timer;
  this.targetLocation = targetLocation;
  this.isTravelingToLocation = true;

  this.hitboxSize = Bomb.HITBOX_SIZE;
}
require('../shared/inheritable');
Bomb.inheritsFrom(Entity);

/** @type {number} */
Bomb.DEFAULT_TIMER = 1500;

/** @type {number} */
Bomb.HITBOX_SIZE = 25;

/** @type {number} */
Bomb.SPEED = 0.75;

/** @type {number} */
Bomb.DECELERATION = 0.05;

/**
 * This is the factory method for creating a Bomb.
 * @param {number} x The x coordinate to create the bomb at.
 * @param {number} y The y coordiante to create the bomb at.
 * @param {Array<number>} targetLocation The location that this bomb was
 *   thrown to by a player.
 * @return {Bomb}
 */
Bomb.create = function(x, y, targetLocation) {
  return new Bomb(x, y, Bomb.DEFAULT_TIMER, targetLocation);
};

/**
 * This methods updates the bomb.
 * @param {Array<Player>} players An array of all the connected players,
 * @param {Array<Bomb>} otherBombs An array of all the other existing bombs.
 * @param {function()} addExplosionCallback The callback function to call
 *   when the bomb explodes.
 */
Bomb.prototype.update = function(players, otherBombs, addExplosionCallback) {
  this.parent.update.call(this);

  if (this.isTravelingToLocation) {
    if (Util.getEuclideanDistance(this.x, this.y, this.targetLocation[0],
                                  this.targetLocation[1]) > 10) {
      var movementAngle = Math.atan2(this.targetLocation[1] - this.y,
          this.targetLocation[0] - this.x);
      this.vx = Math.cos(movementAngle) * Bomb.SPEED;
      this.vy = Math.sin(movementAngle) * Bomb.SPEED;
    } else {
      this.vx = 0;
      this.vy = 0;
      this.isTravelingToLocation = false;
    }
  } else {
    if (Math.abs(this.vx) < Bomb.DECELERATION) {
      this.vx = 0;
    } else {
      this.vx -= Util.getSign(this.vx) * Bomb.DECELERATION;
    }

    if (Math.abs(this.vy) < Bomb.DECELERATION) {
      this.vy = 0;
    } else {
      this.vy -= Util.getSign(this.vy) * Bomb.DECELERATION;
    }
  }

  this.timer -= this.updateTimeDifference;

  if (this.hasExploded()) {
    addExplosionCallback(this.x, this.y);

    for (var i = 0; i < players.length; ++i) {
      var distance = Util.getEuclideanDistance(
          this.x, this.y, players[i].x, players[i].y);
      if (distance < Constants.BOMB_EXPLOSION_RADIUS) {
        var damage = Util.linearScale(
            distance, 0, Constants.BOMB_EXPLOSION_RADIUS, 5, 0);
        players[i].damage(damage);
      }
    }
    for (var i = 0; i < otherBombs.length; ++i) {
      var distance = Util.getEuclideanDistance(
          this.x, this.y, otherBombs[i].x, otherBombs[i].y);
      var angle = Math.atan2(
          otherBombs[i].y - this.y, otherBombs[i].x - this.x);
      if (distance < Constants.BOMB_EXPLOSION_RADIUS) {
        otherBombs[i].vx = Math.cos(angle) * (
            (Constants.BOMB_EXPLOSION_RADIUS - distance) / 75);
        otherBombs[i].vy = Math.sin(angle) * (
            (Constants.BOMB_EXPLOSION_RADIUS - distance) / 75);
      }
    }
  }
};

/**
 * This method returns true if this bomb has exploded.
 * @return {boolean}
 */
Bomb.prototype.hasExploded = function() {
  return this.timer <= 0;
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = Bomb;
