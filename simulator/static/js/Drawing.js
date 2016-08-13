/**
 * @fileoverview This class handles the drawing of crap onto the canvas.
 * @deprecated fuck this lmao this class isn't even being used
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * @constructor
 * @param {CanvasRenderingContext2D} context The canvas context to draw on
 * @param {number} width The width of the canvas, defines the aspect ratio
 *   of the canvas
 * @param {number} height The height of the canvas, defines the aspect ratio
 *   of the canvas
 */
function Drawing(context, width, height) {
  this.context = context;
  this.width = width;
  this.height = height;
}

/**
 * Factory method for a Drawing object.
 * @param {Element} canvas The canvas element to initialize this Drawing
 *   object on
 * @param {number} width The width of the canvas, defines the aspect ratio
 *   of the canvas
 * @param {number} height The height of the canvas, defines the aspect ratio
 *   of the canvas
 * @return {Drawing}
 */
Drawing.create = function(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  return new Drawing(context);
};

/**
 * Sets the dimensions of the canvas.
 * @param {number} width The width of the canvas, defines the aspect ratio
 *   of the canvas
 * @param {number} height The height of the canvas, defines the aspect ratio
 *   of the canvas
 */
Drawing.prototype.setDimensions = function(width, height) {
  this.width = width;
  this.height = height;
  canvas.width = width;
  canvas.height = height;
};

/**
 * Returns the canvas width.
 * @return {number}
 */
Drawing.prototype.getWidth = function() {
  return this.width;
};

/**
 * Returns the canvas height.
 * @return {number}
 */
Drawing.prototype.getHeight = function() {
  return this.height;
};

/**
 * Clears the canvas.
 */
Drawing.prototype.clear = function() {
  this.context.clearRect(0, 0, this.width, this.height);
};

/**
 * Sets the stroke and fill if specified.
 * @param {?string} strokeStyle The stroke style to set to the canvas context
 * @param {?string=} fillStyle The fill style to set to the canvas context
 */
Drawing.prototype.setStrokeFill = function(strokeStyle, fillStyle) {
  if (!strokeStyle) {
    strokeStyle = 'black';
  }
  this.context.strokeStyle = strokeStyle;
  if (!fillStyle) {
    fillStyle = 'transparent';
  }
  this.context.fillStyle = fillStyle;
};

/**
 * Draws a circle onto the canvas.
 * @param {number} cx The x coordinate of the center of the circle
 * @param {number} cy The y coordinate of the center of the circle
 * @param {number} radius The radius of the circle
 * @param {?string=} strokeStyle The stroke style of the circle
 * @param {?string=} fillStyle The fill style of the circle
 */
Drawing.prototype.drawCircle = function(cx, cy, radius,
                                        strokeStyle, fillStyle) {
  this.setStrokeFill(strokeStyle, fillStyle);
  this.context.beginPath();
  this.context.arc(cx, cy, radius, 0, 2 * Math.PI);
  this.context.stroke();
  this.context.fill();
};

/**
 * Draws a polygon onto the canvas.
 * @param {Array.<number>} points An array containing the vertices
 *   of the polygon in the form [x1, y1, x2, y2, x3, y3...]
 * @param {?string=} strokeStyle The stroke style of the polygon
 * @param {?string=} fillStyle The fill style of the polygon
 */
Drawing.prototype.drawPolygon = function(points, strokeStyle, fillStyle) {
  if (!points || points.length < 6 || points.length % 2 == 1) {
    throw new Error('Cannot draw a polygon with points ' + points);
  }
  this.setStrokeFill(strokeStyle, fillStyle);
  this.context.beginPath();
  this.context.moveTo(points[0], points[1]);
  for (var i = 2; i < points.length; i += 2) {
    this.context.lineTo(points[i], points[i + 1]);
  }
  this.context.closePath();
  this.context.stroke();
  this.context.fill();
};
