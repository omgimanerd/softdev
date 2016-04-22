/** 
 * @author Alvin Lin (alvin.lin.dev@gmail.com)
 */

function CircleAnimator(canvas, context, x, y, fillStyle) {
  this.canvas = canvas;
  this.context = context;
  this.x = x;
  this.y = y;
  this.radius = CircleAnimator.MIN_RADIUS;
  this.fillStyle = fillStyle;

  this.rateOfChange = 1;
  this.rgb = [0, 0, 0];
}

CircleAnimator.CANVAS_WIDTH = 800;
CircleAnimator.CANVAS_HEIGHT = 600;
CircleAnimator.MAX_RADIUS = 250;
CircleAnimator.MIN_RADIUS = 50;

CircleAnimator.create = function(canvas, x, y, fillStyle) {
  canvas.width = CircleAnimator.CANVAS_WIDTH;
  canvas.height = CircleAnimator.CANVAS_HEIGHT;
  var context = canvas.getContext('2d');
  return new CircleAnimator(canvas, context, x, y, fillStyle);
};

CircleAnimator.prototype.update = function() {
  if (this.radius <= CircleAnimator.MIN_RADIUS) {
    this.rateOfChange = 1;
  }
  if (this.radius >= CircleAnimator.MAX_RADIUS) {
    this.rateOfChange = -1;
  }
  this.radius += this.rateOfChange;
  for (var i = 0; i < this.rgb.length; ++i) {
    this.rgb[i] = Math.round(this.rgb[i] + (Math.random() * 16)) % 256;
  }
};

CircleAnimator.prototype.draw = function() {
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.context.fillStyle = "rgb(" + this.rgb[0] + "," + this.rgb[1] + "," +
    this.rgb[2] + ")";
  this.context.beginPath();
  this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
  this.context.fill();
};
