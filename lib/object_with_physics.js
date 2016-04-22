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

function ObjectWithPhysics(x, y, vx, vy, ax, ay, radius, mass, fill) {
  this.x = x;
  this.y = y;
  this.vx = vx;
  this.vy = vy;
  this.ax = ax;
    this.ay = ay;
    this.radius = radius;
    this.mass = mass;
    this.fill = fill;
    this.speed = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
    this.currentTime = new Date().getTime();
    this.lastUpdateTime = new Date().getTime();

    this.circle = document.createElementNS(
        'http://www.w3.org/2000/svg', 'circle');
    //    this.updateCircle();


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
    this.updateSpeed();
};

ObjectWithPhysics.prototype.getVY = function() {
  return -this.vy;
};

ObjectWithPhysics.prototype.setVY = function(vy) {
    this.vy = -vy;
    this.updateSpeed();
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

ObjectWithPhysics.prototype.setMass = function(mass) {
    this.mass = mass;
};

ObjectWithPhysics.prototype.getMass = function() {
    return mass;
};

ObjectWithPhysics.prototype.setSpeed = function(speed) {
    this.speed = speed;
};

ObjectWithPhysics.prototype.getSpeed = function() {
    return speed;
};


/**
 * bounceFactor is a decimal from 0 to 1 representing the energy efficiency of the
 * bouncing of the ball, or how much velocity it will bounce back up with.
 * It is set at a default of one when the object is initialized.
 */
ObjectWithPhysics.prototype.setBounce = function(bounceFactor) {
  this.bounceFactor = bounceFactor;
};

ObjectWithPhysics.prototype.getBounce = function(){
    return this.bounceFactor;
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
* Note that this is not setting the speed. This is updating it, say if vx is changed
*/
ObjectWithPhysics.prototype.updateSpeed = function() {
    this.speed = Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
}

/**
 * Friction is a number in pixels / s^2 that the dots will be slowed by
 * when they bounce or hit the ground. It is set at a default of zero when
 * the object is initialized.
 */
ObjectWithPhysics.prototype.setFriction = function(friction) {
  this.friction = friction;
};

/**
* Collision is detected by comparing the square of the radius to the square of the distance formula
* If there is a collision, we calculate the total energy, then multiply it by the bounce factor.
* That is then redistributed to the two objects according to their mass. A little messy and definitely not efficient. Sorry!
TE_i = 1/2 m1 v_1i^2 + 1/2 m2 v_2i^2
TE_f = TE_i * B_f
1/2 m1 v_1f^2 = TE_i * m1/(m1 + m2)
1/2 m2 v_2f^2 = TE_i * m2/(m1 + m2)

v_2f^2 = 2 * TE_i / (m1 + m2)
v_2f = sqrt(2 * TE_i / (m1 + m2))
v_1f^2 = 2 * TE_i / (m1 + m2)


*/
ObjectWithPhysics.prototype.collision = function(otherObjects) {
    for (object in otherObjects) {
        if (Math.pow(object.getX() - this.x, 2) + Math.pow(object.getY - this.y, 2) < Math.pow(this.radius, 2)) {
            objectInitialEnergy  = 0.5 * object.getMass() * (Math.pow(object.getVX(), 2) + Math.pow(object.getVY(), 2))

            thisInitialEnergy  = 0.5 * this.mass * (Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
            totalInitialEnergy = objectInitialEnergy + thisInitialEnergy;
            totalOutEnergy = totalInitialEnergy * (this.bounceFactor + object.getBounceFactor()) / 2;

            objectOutVelocity = Math.sqrt(2 * totalOutEnergy * object.getMass() / (object.getMass() + this.mass));
            thisOutVelocity = Math.sqrt(2 * totalOutEnergy * this.mass / (this.mass + object.getMass()));

            object.setVX(objectOutVelocity * object.getVX() / object.getSpeed());
            object.setVY(objectOutVelocity  * object.getVY() / object.getSpeed());

            this.vx =  thisOutVelocity * this.vx / this.speed;
            this.vy = thisOutVelocity * this.vy / this.speed;

        }

    }

}

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
