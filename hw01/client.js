/** 
 * Client side script for Dotty
 * @author Alvin Lin (alvin.lin@stuypulse.com)
 */

"use strict";

function Dotty(canvasElement, context, clearButtonElement) {
  this.canvasElement = canvasElement;
  this.context = context;
  this.clearButtonElement = clearButtonElement;

  this.clickPoints = [];
}

Dotty.CANVAS_WIDTH = 500;
Dotty.CANVAS_HEIGHT = 500;
Dotty.DOT_RADIUS = 25;

Dotty.create = function(canvasElement, clearButtonElement) {
  canvasElement.height = Dotty.CANVAS_HEIGHT;
  canvasElement.width = Dotty.CANVAS_WIDTH;
  var context = canvasElement.getContext("2d");
  return new Dotty(canvasElement, context, clearButtonElement);
};

Dotty.prototype.clearCanvas = function() {
  this.context.clearRect(0, 0, Dotty.CANVAS_WIDTH, Dotty.CANVAS_HEIGHT);
}

Dotty.prototype.applyEventHandlers = function() {
  var fnContext = this;
  this.canvasElement.onclick = function(event) {
    fnContext.onMouseClick(event.offsetX, event.offsetY);
  };
  this.clearButtonElement.onclick = function(event) {
    fnContext.onClearButtonPress();
  }
};

Dotty.prototype.onMouseClick = function(mouseX, mouseY) {
  var fnContext = this;
  this.clickPoints.push({
    x: event.offsetX,
    y: event.offsetY
  });
  this.clearCanvas();
  this.context.beginPath();
  this.context.strokeStyle = "#000000";
  this.context.moveTo(this.clickPoints[0].x, this.clickPoints[0].y);
  for (let i = 0; i < this.clickPoints.length; ++i) {
    this.context.lineTo(this.clickPoints[i].x, this.clickPoints[i].y);
  }
  this.context.stroke();

  for (let i = 0; i < this.clickPoints.length; ++i) {
    this.context.beginPath();
    var gradient = this.context.createRadialGradient(
      this.clickPoints[i].x, this.clickPoints[i].y,
      Dotty.DOT_RADIUS / 2,
      this.clickPoints[i].x, this.clickPoints[i].y,
      Dotty.DOT_RADIUS);
    gradient.addColorStop(0, "#ABCDEF");
    gradient.addColorStop(1, "#FD2342");
    this.context.fillStyle = gradient;
    this.context.arc(this.clickPoints[i].x, this.clickPoints[i].y,
                     Dotty.DOT_RADIUS, 0, Math.PI * 2);
    this.context.fill();
  }
  this.clickPoints.forEach(function(current, index, array) {
  });
};

Dotty.prototype.onClearButtonPress = function() {
  this.clearCanvas();
  this.clickPoints = [];
};
