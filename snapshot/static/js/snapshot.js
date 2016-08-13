var w3 = "http://www.w3.org/2000/svg";

//Main
var svg = document.getElementById("snapshot");
// border(svg);
camera(svg);
snapText(svg);

if (document.getElementById("snapshot-header")) {
  var header = document.getElementById("snapshot-header");
  camera(header);
  snapText(header);
}

function border(svg) {
  var left0 = Line(0, 0, 50, 0, "#00FF00", 2, 1);
  var left1 = Line(0, 0, 0, 200, "#00FF00", 2, 1);
  var left2 = Line(0, 200, 50, 200, "#00FF00", 2, 1);

  var right0 = Line(440, 0, 390, 0, "#00FF00", 2, 1);
  var right1 = Line(440, 0, 440, 200, "#00FF00", 2, 1);
  var right2 = Line(440, 200, 390, 200, "#00FF00", 2, 1);

  svg.appendChild(left0);
  svg.appendChild(left1);
  svg.appendChild(left2);

  svg.appendChild(right0);
  svg.appendChild(right1);
  svg.appendChild(right2);
}

function camera(svg) {
  var circle = Circle(270, 100, 80, "#00FF00", 5, 1);
  var dot = Circle(270, 100, 1, "#FF0000", 1, 1);
  var top = Line(270, 40, 270, 80, "#00FF00", 3, 1);
  var bot = Line(270, 120, 270, 160, "#00FF00", 3, 1);
  var left = Line(210, 100, 250, 100, "#00FF00", 3, 1);
  var right = Line(290, 100, 330, 100, "#00FF00", 3, 1);
  top.setAttribute("class", "focus-line-top");
  bot.setAttribute("class", "focus-line-bot");
  left.setAttribute("class", "focus-line-left");
  right.setAttribute("class", "focus-line-right");

  svg.appendChild(circle);
  svg.appendChild(dot);
  svg.appendChild(top);
  svg.appendChild(bot);
  svg.appendChild(left);
  svg.appendChild(right);
}

function snapText(svg) {
  var snap = Text("Snap", 20, 70, "#00FF00", 1, 60, "light");
  var sh = Text("Sh", 93, 150, "#00FF00", 1, 60, "light");
  var t = Text("t", 370, 150, "#00FF00", 1, 60, "light");

  svg.appendChild(snap);
  svg.appendChild(sh);
  svg.appendChild(t);
}

function Line(x1, y1, x2, y2, stroke, strokewidth, strokeopacity) {
  var line = document.createElementNS(w3, "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", stroke);
  line.setAttribute("stroke-width", strokewidth);
  line.setAttribute("stroke-opacity", strokeopacity);
  return line;
}

function Circle(cx, cy, r, stroke, strokewidth, strokeopacity) {
  var circle = document.createElementNS(w3, "circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  circle.setAttribute("stroke", stroke);
  circle.setAttribute("stroke-width", strokewidth);
  circle.setAttribute("stroke-opacity", strokeopacity);
  return circle;
}

function Text(textContent, x, y, fill, fillopacity, fontsize, fontweight) {
  var text = document.createElementNS(w3, "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y);
  text.setAttribute("fill", fill);
  text.setAttribute("fill-opacity", fillopacity);
  text.setAttribute("font-size", fontsize);
  text.setAttribute("font-weight", fontweight);
  text.setAttribute("font-family", "Courier, serif");
  text.textContent = textContent;
  return text;
}
