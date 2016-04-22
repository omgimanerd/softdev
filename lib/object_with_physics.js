// Copyright Alvin Lin 2014
/**
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 * Models the physics of a physical object. Does not actually do
 * anything, merely a container for their values.
 * The velocities stored are in terms of pixels/second.
 * Likewise, the accelerations stored are in terms of pixels/second^2.
 * The bounds tell where the object should bounce, they should be less
 * that the actually bouncing borders because the bouncing only occurs
 * when this.x or this.y hit the bound. This assumes that the object
 * is a single point without width or height, so you must factor in
 * the width and height of the object externally.
 */

function ObjectWithPhysics(x, y, vx, vy, ax, ay, radius, fill) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.ax = ax;
    this.ay = ay;
    this.radius = radius;
    this.fill = fill
    this.currentTime = new Date().getTime();
    this.lastUpdateTime = new Date().getTime();

    this.circle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'circle');
    this.updateCircle();


  if (this.ax === null || this.ax === undefined) {
    this.ax = ObjectWithPhysics.DEFAULTAX;
  }
  if (this.ay === null || this.ay === undefined) {
    this.ay = ObjectWithPhysics.DEFAULTAY;
  }

  /* The variables below will be set by methods */
  this.bounceFactor = 1;
  this.friction = 0;
  this.boundsX = [-1000, 1000];
  this.boundsY = [-1000, 1000];
}

/***
    CIRCLE METHODS
***/

/**
  * Returns svg circle
    */
ObjectWithPhysics.prototype.getSVG = function() {
    return this.circle;
}

/**
 * This method actually sets the new attributes of the SVG circle.
 */
ObjectWithPhysics.prototype.updateCircle = function() {
    this.circle.setAttribute('cx', this.x);
    this.circle.setAttribute('cy', this.y);
    this.circle.setAttribute('r', this.radius);
    this.circle.setAttribute('fill', this.fill);
};

ObjectWithPhysics.prototype.getRadius = function() {
    return this.radius;
};

ObjectWithPhysics.prototype.setRadius = function(radius) {
    this.radius = radius;
    this.updateCircle();
};

ObjectWithPhysics.prototype.getFill = function() {
    return this.fill;
};

ObjectWithPhysics.prototype.setFill = function(fill) {
    this.fill = fill;
    this.updateCircle();
};




/**
 * The default downwards acceleration, similar to gravitational acceleration.
 * We will assume acceleration is constant and that our velocity increases
 * or decreases linearly.
 */
ObjectWithPhysics.DEFAULTAY = -200;

/**
 * The default horizontal acceleration. The object should not be accelerating
 * horizontally.
 */
ObjectWithPhysics.DEFAULTAX = 0;

/** Getter and setter methods */
ObjectWithPhysics.prototype.getX = function() {
  return this.x;
};

ObjectWithPhysics.prototype.setX = function(x) {
  this.x = x;
};

ObjectWithPhysics.prototype.getY = function() {
  return this.y;
};

ObjectWithPhysics.prototype.setY = function(y) {
  this.y = y;
};

ObjectWithPhysics.prototype.getXY = function() {
  return [this.x, this.y];
};

/**
 * If there is only one parameter, then we assume that it is an array
 * containing the x and y coordinate. If there are two coordinates, then
 * we assume they are the x and y coordinates respectively.
 */
ObjectWithPhysics.prototype.setXY = function(xy, optY) {
  if (optY === undefined) {
    this.x = xy[0];
    this.y = xy[1];
  } else {
    this.x = xy;
    this.y = optY;
  }
};

/**
 * Y-velocity is negated so that positive numbers represent an
 * upwards acceleration. Same for y-acceleration.
 */
ObjectWithPhysics.prototype.getVX = function() {
  return this.vx;
};

ObjectWithPhysics.prototype.setVX = function(vx) {
  this.vx = vx;
};

ObjectWithPhysics.prototype.getVY = function() {
  return -this.vy;
};

ObjectWithPhysics.prototype.setVY = function(vy) {
  this.vy = -vy;
};

ObjectWithPhysics.prototype.getAX = function() {
  return this.ax;
};

ObjectWithPhysics.prototype.setAX = function(ax) {
  this.ax = ax;
};

ObjectWithPhysics.prototype.getAY = function() {
  return -this.ay;
};

ObjectWithPhysics.prototype.setAY = function(ay) {
  this.ay = -ay;
};

/**
 * bounceFactor is a decimal from 0 to 1 representing the efficiency of the
 * bouncing of the ball, or how much velocity it will bounce back up with.
 * It is set at a default of one when the object is initialized.
 */
ObjectWithPhysics.prototype.setBounce = function(bounceFactor) {
  this.bounceFactor = bounceFactor;
};

ObjectWithPhysics.prototype.setBoundsX = function(boundsX, optMaxBound) {
  if (boundsX !== null && boundsX !== undefined) {
    if (optMaxBound === undefined) {
      this.boundsX = boundsX;
    } else {
      this.boundsX = [boundsX, optMaxBound];
    }
  }
};

ObjectWithPhysics.prototype.setBoundsY = function(boundsY, optMaxBound) {
  if (boundsY !== null && boundsY !== undefined) {
    if (optMaxBound === undefined) {
      this.boundsY = boundsY;
    } else {
      this.boundsY = [boundsY, optMaxBound];
    }
  }
};

/**
 * Friction is a number in pixels / s^2 that the dots will be slowed by
 * when they bounce or hit the ground. It is set at a default of zero when
 * the object is initialized.
 */
ObjectWithPhysics.prototype.setFriction = function(friction) {
  this.friction = friction;
};




/**
 * This function is intended to be called once per 10ms to update the
 * object model according to the physics.
 */
ObjectWithPhysics.prototype.update = function() {
    var currentTime = new Date().getTime();
    this.updateTimeDifference =  this.lastUpdateTime - currentTime;

  this.x = Math.min(Math.max(
      this.boundsX[0], this.x + this.vx * this.updateTimeDifference), this.boundsX[1]);
  this.y = Math.min(Math.max(
      this.boundsY[0], this.y + this.vy * this.updateTimeDifference), this.boundsY[1]);

  if (this.x == this.boundsX[0] || this.x == this.boundsX[1]) {
    this.vx *= -this.bounceFactor;
  }

  this.vx += this.ax / this.updateTimeDifference;
  this.vy -= this.ay / this.updateTimeDifference;
  if (this.y == this.boundsY[1]) {
    this.vy *= -this.bounceFactor;
    if (this.vx > 0) {
        this.vx -= this.friction * this.updateTimeDifference;
    } else if (this.vx < 0) {
      this.vx += this.friction * this.updateTimeDifference;
    }
  }

  if (this.y == this.boundsY[0]) {
    this.vy *= -1;
  }
    this.updateCircle()
};
