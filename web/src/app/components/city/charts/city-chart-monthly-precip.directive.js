(function () {
    'use strict';

    /* Draws a chart of monthly values for precipitation
     *
     * The directive must be used on a <svg> element.
     * @attr data: an object containing scenarios with indicators with years with monthly data
     * @attr options: a config object of the form:
     * {
     *      scenario: 'rcp45', // name of scenario within the 'data' object
     *      indicators: [      // array of indicator keys and labels
     *          {
     *              key: 'monthly_average_max_temp',
     *              label: 'Avg Monthly Max Temp'
     *          }, {
     *              key: 'monthly_average_min_temp',
     *              label: 'Avg Monthly Min Temp'
     *          },
     *      ],
     *      units: {  // unit conversion requirements, passed to the Units service. Optional.
     *          type: 'temp',
     *          from: 'K',
     *          to: 'C',
     *      }
     *  }
     * @attr units: overrides the output units. 'type' and 'from' must be set in 'options'.
     */

    /* @ngInject */
    function MonthlyChartPrecipController($element, $log, $scope, Color, Units) {

        function chartSeriesOptions(type, color) {
                    return {
                        fillColor: color,
                        strokeColor: color,
                        highlightStroke: '#333',
                    };
        }

        var chart;
        var vm = this;
        initialize();

        function initialize() {
            // Look for canvas on self or descendant
            if (!vm.options) {
                throw 'Monthly chart requires the "options" attribute';
            }
            if (!vm.options.scenario) {
                throw 'Monthly chart options must include a "scenario" param';
            }
            if (!vm.options.indicators) {
                throw 'Monthly chart options must include an "indicators" param';
            }
            vm.convertToUnits = getUnitConverter();
            vm.getChart = getChart;

            $scope.$watch(function () { return vm.data; }, onDataChanged);

        }

        function getChart() {
            return chart;
        }

        function onDataChanged(newData) {
            if (_.isUndefined(newData)) {
                return;
            }
            if (_.isEmpty(newData) || _.isEmpty(newData[vm.options.scenario])) {
                $log.error('Monthly chart should not have empty data');
                return;
            }

            var data = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                datasets: generateDatasets(newData[vm.options.scenario], vm.options.indicators)
            };
            buildChart(data);
        }

        function monthName(index) {
            return moment.months()[index];
        }

        function monthNameShort(index) {
            if (index % 2) {
                return moment.monthsShort()[index];
            }
            return "";
        }

        function generateDatasets(data, indicators) {
            var datasets = _.map(indicators, function (indicator) {
                var indicatorDataset = _.map(data[indicator.key], function (yearData, year) {
                    var color = Color.forYear(year);
                    return _.extend(chartSeriesOptions(vm.type, color), {
                        label: indicator.label + ' (' + year + ')',
                        data: _(yearData)
                          .toPairs()
                          .sortBy(function (d) { return parseInt(d[0], 10); })
                          .map(function (d) { return vm.convertToUnits(d[1]); })
                          .value()
                    });
                });
                return indicatorDataset;
            });
            return _.flatten(datasets);
        }

        function buildChart(data) {
            if (!data) {
                return;
            }

            var monthKeys = data.labels;

            var margin = { top: 10, right: 165, bottom: 15, left: 0 };
            var svgElement = $element.find('svg').addBack('svg');
            var height = svgElement.height() - margin.top - margin.bottom;
            var width = svgElement.parent().width() - margin.left - margin.right;
            svgElement.width(svgElement.parent().width());

            var yScaleMargin = 2;

            var min = 0;
            var max = _(data.datasets)
                        .map(function (d) { return d.data; })
                        .flatten()
                        .max();

            var y = d3.scale.linear()
                .domain([min, max + yScaleMargin])
                .range([height - margin.top, 0]);

            var x = d3.scale.ordinal()
                .domain(d3.range(monthKeys.length))
                .rangeRoundBands([0, width], 0.1);

            var xAxis = d3.svg.axis()
                .scale(x)
                .tickFormat(monthNameShort)
                .outerTickSize(0)
                .orient('bottom');

            var xAxisTop = d3.svg.axis()
                .scale(x)
                .tickValues([])
                .outerTickSize(0)
                .innerTickSize(0)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .innerTickSize(-width)
                .outerTickSize(0)
                .ticks(5)
                .orient('left');

            var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .offset([-10, 0])
                        .html(function (d, i) {
                            return [d.label, ' in ', monthName(i),
                                    ': ', d.value.toFixed(2)].join('');
                        });

            var svg = d3.select(svgElement[0]).call(tip);

            // add axes to svg
            svg.append("g").attr("class", "y axis")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(yAxis);
            svg.append("g").attr("class", "x axis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(xAxis);
            svg.append("g").attr("class", "x axis top")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(xAxisTop);

            var plot = svg.append("g")
                    .attr("transform", "translate(" + (margin.left + (x.rangeBand() / 2)) + "," + margin.top + ")");

            var lineFunction = d3.svg.line()
                                   .x(function (d, i) { return x(i); })
                                   .y(function (d) { return y(d); })
                                   .interpolate("linear");

            var group = plot.selectAll("g")
                .data(data.datasets)
                .enter()
                .append("g")
                    .attr("fill", function (d) { return d.fillColor; });

            group.append("path")
                    .attr("d", function (d) { return lineFunction(d.data); })
                    .attr("fill", "none")
                    .attr("stroke-width", 3)
                    .attr("stroke", function (d) { return d.strokeColor; });
            group.selectAll("circle")
                .data(function(d) { return _.map(d.data, function(v) {
                    return { value: v, label: d.label };
                }); })
                .enter().append("circle")
                    .attr("cy", function(d) { return y(d.value); } )
                    .attr("cx", function(d, i) { return x(i); })
                    .attr("r", 4)
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);

        }

        /* Convert units based on the parameters in the chart config, but allowing an attribute
         * given to the directive to override the output units.
         * Looks for a matching conversion function but just returns the value if one isn't found.
         */
        function getUnitConverter() {
            if (!vm.options.units) {
                $log.warn('No unit configuration. Using unconverted values.');
            } else {
                var unitType = vm.options.units.type;
                var fromUnit = vm.options.units.from;
                var toUnit = vm.units || vm.options.units.to;
                var func = Units.converter(unitType, fromUnit, toUnit);
                if (func) {
                    return func;
                } else {
                    $log.warn('No conversion function found for', fromUnit, '->', toUnit, 'conversion');
                }
            }
            return function (value) { return value; };
        }
    }

    /** @ngInject */
    function ccChartMonthlyPrecip() {
        var module = {
            restrict: 'A',
            template: '',
            scope: {
                data: '=',
                options: '=',
                units: '@'
            },
            controller: 'MonthlyChartPrecipController',
            controllerAs: 'mcc',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.charts')
    .controller('MonthlyChartPrecipController', MonthlyChartPrecipController)
    .directive('ccChartMonthlyPrecip', ccChartMonthlyPrecip);

})();
