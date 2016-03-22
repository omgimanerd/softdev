/**
 * Main script for page.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

window.addEventListener('load', function() {
  var container = d3.select('#container');
  var republicans = true;

  var getScaledWidth = d3.scale.linear()
    .domain([0, 500])
    .range([0, 800]);
  var graph = container.selectAll('div').data(delegateData).enter();

  graph.append('div').text(function(data, index) {
    return data.state;
  }).style('width', function(data, index) {
    return getScaledWidth(data.republicanDelegates) + 'px';
  }).style('background-color', '#0000bb');

  document.getElementById('switch').addEventListener('click', function() {
    container.selectAll('div').data(delegateData)
      .transition().duration(1000)
      .style('width', function(data, index) {
        if (republicans) {
          return getScaledWidth(data.democratDelegates) + 'px';
        }
        return getScaledWidth(data.republicanDelegates) + 'px';
      })
      .style('background-color', function() {
        if (republicans) {
          return '#bb0000';
        }
        return '#0000bb';
      });


    republicans = !republicans;
  });
});
