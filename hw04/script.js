/**
 * @fileoverview Script
 */

var circleCanvas = document.getElementById('circle');
var circleStartButton = document.getElementById('circle-start');
var circleStopButton = document.getElementById('circle-stop');
var circle = new Circle(400, 300, 1, "#ff0000");
var circleAnimationId = null;
var isCircleAnimating = false;
var circleDelta = 1;
circleCanvas.appendChild(circle.getSVG());

function animateCircle() {
  if (circle.getRadius() >= 300) {
    circleDelta = -1;
  } else if (circle.getRadius() <= 0) {
    circleDelta = 1;
  }
  circle.setRadius(circle.getRadius() + circleDelta);

  circleAnimationId = window.requestAnimFrame(animateCircle);
}

circleStartButton.addEventListener('click', function() {
  if (!isCircleAnimating) {
    var circleAnimationId = window.requestAnimFrame(animateCircle);
    isCircleAnimating = true;
  }
});

circleStopButton.addEventListener('click', function() {
  window.cancelAnimationFrame(circleAnimationId);
  isCircleAnimating = false;
});

var dvdCanvas = document.getElementById('dvd');
var dvdStartButton = document.getElementById('dvd-start');
var dvdStopButton = document.getElementById('dvd-stop');
var dvd = new Image('./dvd.jpg', 400, 300, 200, 100);
var dvdAnimationId = null;
var isDvdAnimating = false;
var dvdDelta = {
  x: 1,
  y: 1
};
dvdCanvas.appendChild(dvd.getSVG());

function animateDvd() {
  dvd.setX(dvd.getX() + dvdDelta.x);
  dvd.setY(dvd.getY() + dvdDelta.y);
  
  if (dvd.getX() <= 0) {
    dvdDelta.x = 1;
  } else if (dvd.getX() >= 600) {
    dvdDelta.x = -1
  }
  if (dvd.getY() <= 0) {
    dvdDelta.y = 1;
  } else if (dvd.getY() >= 500) {
    dvdDelta.y = -1;
  }

  dvdAnimationId = window.requestAnimFrame(animateDvd);
}

dvdStartButton.addEventListener('click', function() {
  if (!isDvdAnimating) {
    dvdAnimationId = window.requestAnimFrame(animateDvd);
    isDvdAnimating = true;
  }
});

dvdStopButton.addEventListener('click', function() {
  window.cancelAnimationFrame(dvdAnimationId);
  isDvdAnimating = false;
});
