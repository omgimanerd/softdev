/**
 * Manages the player viewport when they move around.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * This class manages the viewport of the client. It is mostly
 * an abstract class that handles the math of converting absolute
 * coordinates to appropriate canvas coordinates.
 * @constructor
 */
function ViewPort() {
  this.selfCoords = [];
}

/**
 * Updates the viewport with this client's player instance's coordinates.
 * @param {number} x The x coordinate of the client's player.
 * @param {number} y The y coordinate of the client's player.
 */
ViewPort.prototype.update = function(x, y) {
  this.selfCoords = [x, y];
};

/**
 * Given a coordinate, this function returns the converted canvas
 * coordinates as a 2-tuple.
 * @param {number} x The x coordinate to convert.
 * @param {number} y The y coordinate to convert.
 * @return {Array<number>}
 */
ViewPort.prototype.toCanvasCoords = function(x, y) {
  var translateX = this.selfCoords[0] - Constants.CANVAS_WIDTH / 2;
  var translateY = this.selfCoords[1] - Constants.CANVAS_HEIGHT / 2;
  return [x - translateX,
          y - translateY];
};


/**
 * Given a canvas coordinate, this function returns the absolute world
 * coordinates as a 2-tuple.
 * @param {number} x The x canvas coordinate to convert.
 * @param {number} y The y canvas coordinate to convert.
 * @return {Array<number>}
 */
ViewPort.prototype.toWorldCoords = function(x, y) {
  var translateX = x - Constants.CANVAS_WIDTH / 2;
  var translateY = y - Constants.CANVAS_HEIGHT / 2;
  return [this.selfCoords[0] + translateX,
          this.selfCoords[1] + translateY];
};
