/** 
 * Main script for page.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

window.addEventListener('load', function() {
  var container = d3.select('#container');
  var graph = container.selectAll('div').data(delegates).enter();
  graph.append('div').text(function(data, index) {
    return states[index];
  }).style('width', function(data, index) {
    return Math.round(data * 6) + 'px';
  });
});
