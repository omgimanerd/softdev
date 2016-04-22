/**
 * @fileoverview Script
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

window.onload = function() {
  var container = Container.create(document.getElementById('canvas'));
  container.beginAnimation();

  document.getElementById('add-ball').addEventListener('click', function() {
    container.addObject(ObjectWithPhysics.createRandom());
  });
};
