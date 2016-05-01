/**
 * @fileoverview This class encapsulates an explosion on the server side.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

var Entity = require('./Entity');

var Util = require('../shared/Util');

/**
 * Constructor for an Explosion class.
 * @constructor
 * @param {number} x The x coordinate to create the explosion at.
 * @param {number} y The y coordinate to create the explosion at.
 * @param {number} creationTime The time that the explosion was created.
 * @param {number} duration The duration in milliseconds that the explosion
 *   should last.
 * @extends {Entity}
 */
function Explosion(x, y, creationTime, duration) {
  this.x = x;
  this.y = y;

  this.creationTime = creationTime;
  this.duration = duration;
  this.frame = 0;
}
require('../shared/inheritable');
Explosion.inheritsFrom(Entity);

/** @type {number} */
Explosion.DEFAULT_DURATION = 1000;

/**
 * The frame rate in milliseconds per frame.
 * @type {number}
 */
Explosion.FRAME_RATE = 100;

/** @type {number} */
Explosion.MAX_FRAMES = 10;

/**
 * This is a factory method to create an Explosion class.
 * @param {number} x The x coordinate to create the explosion at.
 * @param {number} y The y coordinate to create the explosion at.
 * @return {Explosion}
 */
Explosion.create = function(x, y) {
  return new Explosion(x, y, (new Date()).getTime(),
      Explosion.DEFAULT_DURATION);
};

/**
 * This method updates the explosion and calculates what frame should be
 * displayed.
 */
Explosion.prototype.update = function() {
  var frame = ((new Date()).getTime() - this.creationTime) %
      Explosion.FRAME_RATE;
  this.frame = Util.bound(frame, 0, Explosion.MAX_FRAMES);
};

/**
 * This method returns whether or not this explosion should exist.
 * @return {boolean}
 */
Explosion.prototype.shouldExist = function() {
  return (new Date()).getTime() - this.creationTime > this.duration;
};

/**
 * This line is needed on the server side since this is loaded as a module
 * into the node server.
 */
module.exports = Explosion;
