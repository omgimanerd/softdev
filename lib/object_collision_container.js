// Copyright Alvin Lin 2014
/**
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 * A container class for all physical objects that must interact
 * with each other. The physical objects must have their own
 * ObjectPhysicsModel. This class will handle object collisions
 * by calling methods from their ObjectPhysicsModel.
 */

function ObjectCollisionContainer() {
  this.objects = [];
}

/** Adds an ObjectPhysicsModel to the array for updating. */
ObjectCollisionContainer.prototype.addObject = function(object) {
  this.objects.push(object);
};

ObjectCollisionContainer.prototype.removeObject = function(object) {
  var index = this.objects.indexOf(object);
  if (index != -1) {
    this.objects.splice(index, 1);
  }
};

ObjectCollisionContainer.prototype.getObjects = function() {
  return this.objects;
};
