// Copyright Alvin Lin 2014
/**
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 * Generates and returns an SVG circle.
 * Has methods of mutability.
 */

function Circle(x, y, radius, fill) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.fill = fill;
  this.model = null;

  this.circle = document.createElementNS(
    'http://www.w3.org/2000/svg', 'circle');
  this.updateCircle();
}

Circle.prototype.getSVG = function() {
  return this.circle;
};

/**
 * Updates the PhysicalObjectModel and the circle.
 * Therefore, this must be called every ms.
 */
Circle.prototype.updateWithPhysics = function() {
  if (this.model !== null) {
    this.model.update();
    this.setXY(this.model.getXY());
  }
};

/**
 * This method actually sets the new attributes of the SVG circle.
 */
Circle.prototype.updateCircle = function() {
  this.circle.setAttribute('cx', this.x);
  this.circle.setAttribute('cy', this.y);
  this.circle.setAttribute('r', this.radius);
  this.circle.setAttribute('fill', this.fill);
  if (this.model !== null) {
    this.model.setXY(this.getXY());
  }
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

Circle.prototype.getXY = function() {
  return [this.x, this.y];
};

/**
 * If there is only one parameter, then we assume that it is an array
 * containing the x and y coordinate. If there are two coordinates, then
 * we assume they are the x and y coordinates respectively.
 */
Circle.prototype.setXY = function(xy, optY) {
  if (optY === undefined) {
    this.x = xy[0];
    this.y = xy[1];
  } else {
    this.x = xy;
    this.y = optY;
  }
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

Circle.prototype.setModel = function(model) {
  this.model = model;
};

Circle.prototype.getModel = function() {
  return this.model;
};

/* Get and set methods that apply only if a model exists */

Circle.prototype.getVX = function() {
  if (this.model !== null) {
    return this.model.getVX();
  }
};

Circle.prototype.setVX = function(vx) {
  if (this.model !== null) {
    this.model.setVX(vx);
  }
};

Circle.prototype.getVY = function() {
  if (this.model !== null) {
    return this.model.getVY();
  }
};

Circle.prototype.setVY = function(vy) {
  if (this.model !== null) {
    this.model.setVY(vy);
  }
};

Circle.prototype.getAX = function() {
  if (this.model !== null) {
    return this.model.getAX();
  }
};

Circle.prototype.setAX = function(ax) {
  if (this.model !== null) {
    this.model.setAX(ax);
  }
};

Circle.prototype.getAY = function() {
  if (this.model !== null) {
    return this.model.getAY();
  }
};

Circle.prototype.setAY = function(ay) {
  if (this.model !== null) {
    this.model.setAY(ay);
  }
};

Circle.prototype.setBounce = function(bounceFactor) {
  if (this.model !== null) {
    this.model.setBounce(bounceFactor);
  }
};

Circle.prototype.setBoundsX = function(boundsX, optMaxBound) {
  if (this.model !== null) {
    this.model.setBoundsX(boundsX, optMaxBound);
  }
};

Circle.prototype.setBoundsY = function(boundsY, optMaxBound) {
  if (this.model !== null) {
    this.model.setBoundsY(boundsY, optMaxBound);
  }
};

Circle.prototype.setFriction = function(friction) {
  if (this.model !== null) {
    this.model.setFriction(friction);
  }
};
