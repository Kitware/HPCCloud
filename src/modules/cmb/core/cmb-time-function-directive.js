angular.module('kitware.cmb.core')
    .directive('cmbTimeFunction',  ['$templateCache', function ($templateCache) {

        return {
            restrict: 'AE',
            scope: {
                data: '=',
                key: '@',
            },
            template: $templateCache.get('cmb/core/tpls/cmb-time-function-panel.html'),
            link: function(scope, element, attrs) {
                // Check we have File API support
                if (typeof window.FileReader === 'undefined') {
                    throw 'File API & FileReader available not supported by browser';
                }

                function createChart() {
                    var chart = {};

                    var margin = {top: 20, right: 20, bottom: 30, left: 50},
                    width = d3.select($('#cmb-time-function-chart', element).get(0)).node().offsetWidth - margin.left - margin.right,
                    height = d3.select($('#cmb-time-function-chart', element).get(0)).node().offsetHeight - margin.top - margin.bottom;

                    var x = d3.scale.linear()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient('bottom');

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient('left');

                    var line = d3.svg.line()
                        .x(function(d) { return x(d.x); })
                        .y(function(d) { return y(d.y); });

                    var svg = d3.select($('#cmb-time-function-chart', element).get(0)).append('svg')
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    svg.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + height + ')');

                    svg.append('g')
                        .attr('class', 'y axis');

                    chart.update = function(data) {

                        x.domain(d3.extent(data, function(d) { return d.x; }));
                        y.domain(d3.extent(data, function(d) { return d.y; }));

                        svg.select('.x.axis')
                            .transition().duration(1000).ease('sin-in-out')
                            .call(xAxis);

                        svg.select('.y.axis')
                            .transition().duration(1000).ease('sin-in-out')
                            .call(yAxis);

                        var path = svg.select('path.line');

                        if (path.empty()) {
                          path = svg.append('path');
                        }

                        path.datum(data)
                          .transition()
                          .duration(1000)
                          .ease('sin-in-out')
                            .attr('class', 'line')
                            .attr('d', line);

                    };

                    return chart;
                }

                var chart = null;

                scope.textarea = {text: 'Drag time function data here.'};
                scope.valid = true;
                scope.tabIndex = 0;

                function ParseError(line) {
                    this.line = line;
                }

                function parse(text) {
                    var lines = text.split('\n'), data = [];

                    var parseFloat = function(float) {
                        float = float.trim();

                        if(/^[0-9]+[.]?[0-9]*$/.test(float) ||
                           /^[0-9]*[.]?[0-9]+$/.test(float)) {
                            return Number.parseFloat(float);
                        }

                      return NaN;
                    };

                    $.each(lines, function(i, line) {
                        if (line.length === 0) {
                            return;
                        }

                        line = line.trim();

                        var xy = line.split(',');

                        if (xy.length !== 2) {
                            throw new ParseError(i);
                        }

                        if (xy[0].length === 0 || xy[1].length === 0) {
                            throw new ParseError(i);
                        }

                        var x = parseFloat(xy[0]);
                        var y = parseFloat(xy[1]);

                        if (isNaN(x) || isNaN(y)) {
                            throw new ParseError(i);
                        }

                        data.push({
                            x: x,
                            y: y
                        });
                    });

                    return data;
                }

                scope.update = function(text) {
                    text = text || scope.textarea.text;

                    if (text === 'Drag time function data here.') {
                        return;
                    }

                    try {
                        var data = parse(text);
                        scope.valid = true;
                        chart.update(data);
                        scope.textarea.text = text;
                        scope.data[scope.key] = data;
                    }
                    catch(ex) {
                        if (ex instanceof ParseError)  {
                            scope.valid = false;
                            console.log('invalid');
                        }
                        else {
                            throw ex;
                        }
                    }
                };

                $('#cmb-time-function-drop-zone', element).on('dragover', function(e) {
                    e.preventDefault();
                    return false;
                });

                $('#cmb-time-function-drop-zone', element).on('dragend', function(e) {
                    e.preventDefault();
                    return false;
                });

                $('#cmb-time-function-drop-zone', element).on('drop', function(de) {
                    de.preventDefault();

                    if (!chart) {
                        $('#cmb-time-function-chart').empty();
                        chart = createChart();
                    }

                    var dataTransfer = de.originalEvent.dataTransfer,
                        file = dataTransfer.files[0], reader = new FileReader();

                    reader.onload = function(le) {
                        var text = this.result;

                        scope.update(text);
                        scope.$apply();
                    };

                    reader.readAsText(file);

                    return false;
                });
            }
        };
    }]);