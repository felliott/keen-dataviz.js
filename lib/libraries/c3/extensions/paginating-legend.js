var each = require('../../../utils/each'),
    isDateString = require('../../../utils/assert-date-string');

module.exports = function(columns){
  var self = this;
  var domNode = this.el().querySelector('.' + this.theme() + '-rendering');

  var pagination = self.view._artifacts.pagination;
  // {
  //   labels: [first N records],
  //   position: 0,
  //   range: Number(((domNode.offsetHeight - 100) / 16).toFixed(0)),
  //   total: columns.length
  // };

  function paginateData(){
    var labels = [];
    each(columns, function(column, i){
      if (isDateString(self.data()[1][0]) && column[0] === 'x') {
        return;
      }
      labels.push(column[0]);
    });
    labels = labels.splice(pagination.position, pagination.range);
    self.view._artifacts.pagination.labels = labels;
    render.call(self, labels);
    // console.log(pagination.position, pagination.range);
    // console.log(labels);
    self.view._artifacts.c3.resize();
  }

  var legendEl = d3.select(domNode)
    .append('svg')
    .attr('class', 'keen-c3-legend')
    .attr('width', 110)
    .attr('height', domNode.offsetHeight)
    .style('right', '-120px');

  var legendItems = legendEl
    .append('g')
    .attr('class', 'keen-c3-legend-items');

  paginateData();

  function render(d){

    legendItems
      .selectAll('g')
      .remove();

    var paginateEl = legendItems
      .selectAll('g')
      .data(d);

    paginateEl.enter()
        .append('g')
        .attr('transform', function(id, i){
          return 'translate(0, ' + (20 * i) + ')'
        })
      .attr('data-id', function (id) { return id; })
      .each(function (id) {
        d3.select(this)
          .append('text')
          .attr('font-size', 12)
          .attr('pointer-events', 'none')
          .attr('x', 15)
          .attr('y', 9)
          // .style('pointer-events', 'none')
          .text(id)
          .text(function(id){
            if (d3.select(this).node().getBBox().width > 105) {
              return id.length <= 15 ? id : id.substring(0, 12) + '...';
            }
            else {
              return id;
            }
          });
        d3.select(this)
          .append('rect')
          .attr('height', 14)
          .attr('width', 110)
          .attr('x', 0)
          .attr('y', 0)
          .style('fill-opacity', 0)
          .style('cursor', 'pointer');
        d3.select(this)
          .append('rect')
          .attr('fill', self.view._artifacts['c3'].color(id))
          .attr('pointer-events', 'none')
          .attr('height', 10)
          .attr('width', 10)
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('x', 0)
          .attr('y', 0);
          // .style('pointer-events', 'none');
      })
      .on('mouseover', function (id, i) {
          self.view._artifacts['c3'].focus(id);
          // show a tooltip overlay w/ full value
          if (id.length > 15) {
            d3.select(self.el().querySelector('.' + self.theme() + '-rendering'))
              .append('div')
              .attr('class', 'keen-c3-legend-label-overlay')
              .style('right', '-120px')
              .style('top', (5 + (i+1) * 20) + 'px')
              .style('max-width', '75%')
              .html(id)
              .append('div')
                .attr('class', 'keen-c3-legend-label-overlay-pointer');
          }
      })
      .on('mouseout', function (id) {
          self.view._artifacts['c3'].revert();
          // clear out the tooltip overlay
          d3.select(self.el().querySelector('.' + self.theme() + '-rendering .keen-c3-legend-label-overlay'))
            .remove();
      })
      .on('click', function (id) {
          self.view._artifacts['c3'].toggle(id);
      });

    paginateEl.exit().remove();
  }

  // d3.select(this.el().querySelector('.' + this.theme() + '-rendering svg.keen-c3-legend'))
  legendEl
    .append('g')
      .attr('class', 'keen-c3-legend-pagination')
      .attr('transform', function(){
        return 'translate(2, ' + (20 * self.view._artifacts.pagination.labels.length) + ')'
      })
      .selectAll('g')
      .data([
        { direction: 'reverse', path_d: 'M0 10 L10 0 L20 10 Z' },
        { direction: 'forward', path_d: 'M0 0 L10 10 L20 0 Z' }
      ])
      .enter()
      .append('g')
      .attr('transform', function(id, i){
        return 'translate(' + (i * 20) + ', 0)'
      })
      .each(function(id){
        d3.select(this)
          .append('path')
          .attr('d', function(d){
            return d.path_d;
          })
          .style('cursor', 'pointer')
          .style('fill', '#D7D7D7')
          .style('stroke', 'none')
          .on('mouseover', function (id) {
            d3.select(this).style('fill', '#4D4D4D');
          })
          .on('mouseout', function (id) {
            d3.select(this).style('fill', '#D7D7D7');
          })
          .on('click', function (d) {
            console.log('pagination clicked: ', d.direction);
            // {
            //   position: 0,
            //   range: Number(((domNode.offsetHeight - 100) / 16).toFixed(0)),
            //   total: columns.length
            // }
            var pag = self.view._artifacts.pagination;
            if (d.direction === 'forward') {
              if (pag.position + pag.range < pag.total) {
                self.view._artifacts.pagination.position = self.view._artifacts.pagination.position + self.view._artifacts.pagination.range;
                // self.update();
                paginateData();
              }
            }
            else {
              if (pag.position - pag.range >= 0) {
                self.view._artifacts.pagination.position = self.view._artifacts.pagination.position - self.view._artifacts.pagination.range;
                // self.update();
                paginateData();
              }
            }
            //toggle();
            console.log(self.view._artifacts.pagination);
          });
      });
};