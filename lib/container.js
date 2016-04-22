/**
 * @fileoverview Container for all the objects inside the canvas.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

function Container(canvas) {
  this.canvas = canvas;

  this.objects = [];

  this.animationFrameId = null;
}

Container.create = function(canvas) {
  var container = new Container(canvas);
  for (var i = 0; i < 10; ++i) {
    container.addObject(ObjectWithPhysics.createRandom());
  }
  return container;
};

Container.prototype.addObject = function(object) {
  this.canvas.appendChild(object.getSVG());
  this.objects.push(object);
};

Container.prototype.beginAnimation = function() {
  this.animationFrameId = window.requestAnimationFrame(
    bind(this, this.update));
};

Container.prototype.stopAnimation = function() {
  window.cancelAnimationFrame(this.animationFrameId);
};

Container.prototype.update = function() {
  var obj = this.objects;
  for (var i = 0; i < obj.length; ++i) {
    obj[i].update(obj.slice(0, i).concat(obj.slice(i)));
  }
  this.beginAnimation();
};
