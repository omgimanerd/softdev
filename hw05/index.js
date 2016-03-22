/**
 * Main script for page.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

window.addEventListener('load', function() {
  var container = d3.select('#container');
  var republicans = true;

  var getScaledWidth = d3.scale.linear()
    .domain([0, 500])
    .range([0, 1000]);

  var graph = container.selectAll('div')
    .data(delegateData)
    .enter()
    .append('div')
    .attr('class', 'state-container');

  container.selectAll('.state-container')
    .data(delegateData)
    .append('div')
    .attr('class', 'state-label')
    .text(function(data) {
      return data.state;
    });

  container.selectAll('.state-container')
    .data(delegateData)
    .append('div')
    .attr('class', 'state-bar')
    .style('width', function(data, index) {
      return getScaledWidth(data.republicanDelegates) + 'px';
    })
    .style('background-color', '#0000bb');

  document.getElementById('switch').addEventListener('click', function() {
    container.selectAll('.state-bar').data(delegateData)
      .transition()
      .duration(1000)
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

    if (republicans) {
      d3.select('#title')
        .text('Democratic Delegates');
    } else {
      d3.select('#title')
        .text('Republican Delegates');
    }

    republicans = !republicans;
  });
});
