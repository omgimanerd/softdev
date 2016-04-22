/**
 * @fileoverview This class encapsulates an SVG image and has methods of
 *   mutability to allow for modification and animation.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

function Image(href, x, y, width, height) {
  this.href = href;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.image = document.createElementNS('http://www.w3.org/2000/svg',
                                        'image');
  this.updateImage();
}

Image.prototype.getSVG = function() {
  return this.image;
};

Image.prototype.updateImage = function() {
  this.image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.href);
  this.image.setAttribute('x', this.x);
  this.image.setAttribute('y', this.y);
  this.image.setAttribute('width', this.width);
  this.image.setAttribute('height', this.height);
};

Image.prototype.getX = function() {
  return this.x;
};

Image.prototype.setX = function(x) {
  this.x = x;
  this.updateImage();
};

Image.prototype.getY = function() {
  return this.y;
};

Image.prototype.setY = function(y) {
  this.y = y;
  this.updateImage();
};

Image.prototype.getXY = function() {
  return [this.x, this.y];
};

Image.prototype.getWidth = function() {
  return this.width;
};

Image.prototype.setWidth = function(width) {
  this.width = width;
  this.updateImage();
};

Image.prototype.getHeight = function() {
  return this.height;
};

Image.prototype.setHeight = function(height) {
  this.height = height;
  this.updateImage();
};
