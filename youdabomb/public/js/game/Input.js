/**
 * This class keeps track of the user input in global variables.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * Empty constructor for the Input object.
 */
function Input() {
  throw new Error('Input should not be instantiated!');
}

/** @type {boolean} */
Input.LEFT_CLICK = false;
/** @type {boolean} */
Input.RIGHT_CLICK = false;
/** @type {Array<number>} */
Input.MOUSE = [];

/** @type {boolean} */
Input.LEFT = false;
/** @type {boolean} */
Input.UP = false;
/** @type {boolean} */
Input.RIGHT = false;
/** @type {boolean} */
Input.DOWN = false;
/** @type {Object<number, boolean>} */
Input.MISC_KEYS = {};

/**
 * This method is a callback bound to the onmousedown event on the document
 * and updates the state of the mouse click stored in the Input class.
 * @param {Event} e The event passed to this function.
 */
Input.onMouseDown = function(e) {
  if (e.which == 1) {
    Input.LEFT_CLICK = true;
  } else if (e.which == 3) {
    Input.RIGHT_CLICK = true;
  }
};

/**
 * This method is a callback bound to the onmouseup event on the document and
 * updates the state of the mouse click stored in the Input class.
 * @param {Event} e The event passed to this function.
 */
Input.onMouseUp = function(e) {
  if (e.which == 1) {
    Input.LEFT_CLICK = false;
  } else if (e.which == 3) {
    Input.RIGHT_CLICK = false;
  }
};

/**
 * This method is a callback bound to the onkeydown event on the document and
 * updates the state of the keys stored in the Input class.
 * @param {Event} e The event passed to this function.
 */
Input.onKeyDown = function(e) {
  switch (e.keyCode) {
    case 37:
    case 65:
      Input.LEFT = true;
      break;
    case 38:
    case 87:
      Input.UP = true;
      break;
    case 39:
    case 68:
      Input.RIGHT = true;
      break;
    case 40:
    case 83:
      Input.DOWN = true;
      break;
    default:
      Input.MISC_KEYS[e.keyCode] = true;
      break;
  }
};

/**
 * This method is a callback bound to the onkeyup event on the document and
 * updates the state of the keys stored in the Input class.
 * @param {Event} e The event passed to this function.
 */
Input.onKeyUp = function(e) {
  switch (e.keyCode) {
    case 37:
    case 65:
      Input.LEFT = false;
      break;
    case 38:
    case 87:
      Input.UP = false;
      break;
    case 39:
    case 68:
      Input.RIGHT = false;
      break;
    case 40:
    case 83:
      Input.DOWN = false;
      break;
    default:
      Input.MISC_KEYS[e.keyCode] = false;
  }
};

/**
 * This should be called during initialization to allow the Input
 * class to track user input.
 */
Input.applyEventHandlers = function() {
  document.addEventListener('mousedown', Input.onMouseDown);
  document.addEventListener('mouseup', Input.onMouseUp);
  document.addEventListener('keyup', Input.onKeyUp);
  document.addEventListener('keydown', Input.onKeyDown);
};

/**
 * This should to assign a mouse tracking event listener to an element.
 * @param {Element} element The element to apply the event listener to.
 */
Input.addMouseTracker = function(element) {
  element.addEventListener('mousemove', function(event) {
    var boundingRect = element.getBoundingClientRect();
    Input.MOUSE = [event.pageX - boundingRect.left,
                   event.pageY - boundingRect.top];
  });
};
