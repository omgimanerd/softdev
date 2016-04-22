/**
 * @fileoverview This function is needed to bind function contexts.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * Binds a function to a context, useful for assigning event handlers and
 * function callbacks.
 * @param {Object} context The context to assign the method to.
 * @param {function(?)} method The method to bind the context to.
 * @return {function(?)}
 */
function bind(context, method) {
  return function() {
    return method.apply(context, arguments);
  };
}
