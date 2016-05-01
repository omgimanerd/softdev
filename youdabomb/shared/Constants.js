/**
 * @fileoverview This class stores global constants between the client and
 *   server.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * Empty constructor for the Constants class.
 */
function Constants() {
  throw new Error('Constants should not be instantiated!');
}

/**
 * The world will always be a square, so there's no need for an x and y max.
 * All values are in pixels.
 */

/** @type {number} */
Constants.WORLD_MIN = 0;

/** @type {number} */
Constants.WORLD_MAX = 2500;

/** @type {number} */
Constants.WORLD_PADDING = 50;

/** @type {number} */
Constants.CANVAS_WIDTH = 800;

/** @type {number} */
Constants.CANVAS_HEIGHT = 600;

/** @type {number} */
Constants.VISIBILITY_THRESHOLD_X = 450;

/** @type {number} */
Constants.VISIBILITY_THRESHOLD_Y = 350;

/** @type {number} */
Constants.BOMB_EXPLOSION_RADIUS = 175;

try {
  /**
   * This line is needed on the server side so that other modules can use the
   * Util class, but since module does not exist in the client side, we enclose
   * this in a try catch block to catch and suppress that error.
   */
  module.exports = Constants;
} catch (err) {}
