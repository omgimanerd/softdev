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

function ObjectPhysicsModel(x, y, vx, vy, ax, ay) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.ax = ax;
  this.ay = ay;

  if (this.ax === null || this.ax === undefined) {
    this.ax = ObjectPhysicsModel.DEFAULTAX;
  }
  if (this.ay === null || this.ay === undefined) {
    this.ay = ObjectPhysicsModel.DEFAULTAY;
  }

  /* The variables below will be set by methods */
  this.bounceFactor = 1;
  this.friction = 0;
  this.boundsX = [-1000, 1000];
  this.boundsY = [-1000, 1000];
}

/**
 * The default downwards acceleration, similar to gravitational acceleration.
 * We will assume acceleration is constant and that our velocity increases
 * or decreases linearly.
 */
ObjectPhysicsModel.DEFAULTAY = -200;

/**
 * The default horizontal acceleration. The object should not be accelerating
 * horizontally.
 */
ObjectPhysicsModel.DEFAULTAX = 0;

/** Getter and setter methods */
ObjectPhysicsModel.prototype.getX = function() {
  return this.x;
};

ObjectPhysicsModel.prototype.setX = function(x) {
  this.x = x;
};

ObjectPhysicsModel.prototype.getY = function() {
  return this.y;
};

ObjectPhysicsModel.prototype.setY = function(y) {
  this.y = y;
};

ObjectPhysicsModel.prototype.getXY = function() {
  return [this.x, this.y];
};

/**
 * If there is only one parameter, then we assume that it is an array
 * containing the x and y coordinate. If there are two coordinates, then
 * we assume they are the x and y coordinates respectively.
 */
ObjectPhysicsModel.prototype.setXY = function(xy, optY) {
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
ObjectPhysicsModel.prototype.getVX = function() {
  return this.vx;
};

ObjectPhysicsModel.prototype.setVX = function(vx) {
  this.vx = vx;
};

ObjectPhysicsModel.prototype.getVY = function() {
  return -this.vy;
};

ObjectPhysicsModel.prototype.setVY = function(vy) {
  this.vy = -vy;
};

ObjectPhysicsModel.prototype.getAX = function() {
  return this.ax;
};

ObjectPhysicsModel.prototype.setAX = function(ax) {
  this.ax = ax;
};

ObjectPhysicsModel.prototype.getAY = function() {
  return -this.ay;
};

ObjectPhysicsModel.prototype.setAY = function(ay) {
  this.ay = -ay;
};

/**
 * bounceFactor is a decimal from 0 to 1 representing the efficiency of the
 * bouncing of the ball, or how much velocity it will bounce back up with.
 * It is set at a default of one when the object is initialized.
 */
ObjectPhysicsModel.prototype.setBounce = function(bounceFactor) {
  this.bounceFactor = bounceFactor;
};

ObjectPhysicsModel.prototype.setBoundsX = function(boundsX, optMaxBound) {
  if (boundsX !== null && boundsX !== undefined) {
    if (optMaxBound === undefined) {
      this.boundsX = boundsX;
    } else {
      this.boundsX = [boundsX, optMaxBound];
    }
  }
};

ObjectPhysicsModel.prototype.setBoundsY = function(boundsY, optMaxBound) {
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
ObjectPhysicsModel.prototype.setFriction = function(friction) {
  this.friction = friction;
};

/**
 * This function is intended to be called once per 10ms to update the
 * object model according to the physics.
 */
ObjectPhysicsModel.prototype.update = function() {
  this.x = Math.min(Math.max(
      this.boundsX[0], this.x + this.vx / 100), this.boundsX[1]);
  this.y = Math.min(Math.max(
      this.boundsY[0], this.y + this.vy / 100), this.boundsY[1]);

  if (this.x == this.boundsX[0] || this.x == this.boundsX[1]) {
    this.vx *= -this.bounceFactor;
  }

  this.vx += this.ax / 100;
  this.vy -= this.ay / 100;
  if (this.y == this.boundsY[1]) {
    this.vy *= -this.bounceFactor;
    if (this.vx > 0) {
      this.vx -= this.friction / 100;
    } else if (this.vx < 0) {
      this.vx += this.friction / 100;
    }
  }

  if (this.y == this.boundsY[0]) {
    this.vy *= -1;
  }
};
