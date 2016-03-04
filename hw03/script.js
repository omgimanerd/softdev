/**
 * Script for bouncing DVD image.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

function BouncingImageAnimator(context, x, y, image) {
  this.context = context;

  this.x = x;
  this.y = y;
  this.xChange = 1;
  this.yChange = 1;

  this.image = image;
}

BouncingImageAnimator.CANVAS_WIDTH = 800;
BouncingImageAnimator.CANVAS_HEIGHT = 600;

BouncingImageAnimator.create = function(canvas) {
  canvas.width = BouncingImageAnimator.CANVAS_WIDTH;
  canvas.height = BouncingImageAnimator.CANVAS_HEIGHT;
  var image = new Image();
  image.src = "./dvd.jpg";

  var x = Math.floor(
    Math.random() * (BouncingImageAnimator.CANVAS_WIDTH - image.width));
  var y = Math.floor(
    Math.random() * (BouncingImageAnimator.CANVAS_HEIGHT - image.height));

  return new BouncingImageAnimator(
    canvas.getContext('2d'), x, y, image
  );
};

BouncingImageAnimator.prototype.update = function() {
  this.x += this.xChange;
  this.y += this.yChange;
  if (this.x <= 0) {
    this.xChange = 1;
  } else if (this.x >= BouncingImageAnimator.CANVAS_WIDTH - this.image.width) {
    this.xChange = -1;
  }
  if (this.y <= 0) {
    this.yChange = 1;
  } else if (this.y >= BouncingImageAnimator.CANVAS_HEIGHT - this.image.height) {
    this.yChange = -1;
  }
};

BouncingImageAnimator.prototype.draw = function() {
  this.context.clearRect(0, 0, BouncingImageAnimator.CANVAS_WIDTH,
                         BouncingImageAnimator.CANVAS_HEIGHT);
  this.context.drawImage(this.image, this.x, this.y);
};
