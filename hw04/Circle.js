/**
 * @fileoverview This class encapsulates an SVG circle and has methods
 *   mutability to allow for modification and animation.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

function Circle(x, y, radius, fill) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.fill = fill;

  this.circle = document.createElementNS('http://www.w3.org/2000/svg',
                                          'circle');
  this.updateCircle();
}

Circle.prototype.getSVG = function() {
  return this.circle;
};

Circle.prototype.updateCircle = function() {
  this.circle.setAttribute('cx', this.x);
  this.circle.setAttribute('cy', this.y);
  this.circle.setAttribute('r', this.radius);
  this.circle.setAttribute('fill', this.fill);
};

Circle.prototype.getX = function() {
  return this.x;
};

Circle.prototype.setX = function(x) {
  this.x = x;
  this.updateCircle();
};

Circle.prototype.getY = function() {
  return this.y;
};

Circle.prototype.setY = function(y) {
  this.y = y;
  this.updateCircle();
};

Circle.prototype.getRadius = function() {
  return this.radius;
};

Circle.prototype.setRadius = function(radius) {
  this.radius = radius;
  this.updateCircle();
};

Circle.prototype.getFill = function() {
  return this.fill;
};

Circle.prototype.setFill = function(fill) {
  this.fill = fill;
  this.updateCircle();
};
