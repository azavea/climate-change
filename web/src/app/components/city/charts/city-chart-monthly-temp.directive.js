(function () {
    'use strict';

    /* Draws a chart of monthly temperatures, with floating bars for the monthly average min/max
     * and marks at the absolute monthly min/max.
     *
     * Must be used on an <svg> element or an element containing an <svg>.
     *
     * The indicator names are currently hard-coded.
     *
     * @attr data: an object containing scenarios with indicators with years with monthly data
     * @attr scenario: the scenario to use from the data (e.g. 'rcp45')
     * @attr units: the units to show temperatures in. Defaults to 'C'.
     */

    /** @ngInject */
    function MonthlyTempChartController($element, $scope, Units, Color) {
        var vm = this;
        initialize();

        // Note: these are also hard-coded in a few places further down
        var indicators = ['monthly_average_max_temp', 'monthly_average_min_temp',
                          'monthly_max_temp', 'monthly_min_temp'];
        var dataLabels = ['Monthly Maximum High', 'Monthly Average High',
                         'Monthly Average Low', 'Monthly Minimum Low'];

        function initialize() {
            if (!vm.scenario) {
                throw 'Chart requires the "scenario" attribute';
            }

            vm.unitConverter = Units.converter('temp', 'K', vm.units || 'C');

            $scope.$watch(function () {
                if (vm.data && vm.data[vm.scenario]) {
                    return vm.data[vm.scenario];
                }
            }, buildChart);
        }

        function monthName(index) {
            return moment.months()[index];
        }

        function monthNameShort(index) {
            if (index % 2){
                return moment.monthsShort()[index];
            }
            return "";
        }

        function makeTip(d) {
            return ['<div class="chart-tip-container">' +
                        '<div class="chart-tip-header">' +
                        monthName(d.monthIndex) + ' ' + d.year +
                        '</div>' +
                        '<div class="chart-tip-body">']
                        .concat(_.map(dataLabels, function (label, i) {
                        return '<div class="chart-tip-row">' +
                                    '<span class="chart-tip-label">' + label + ': </span>' +
                                    '<span class="chart-tip-data">' + Math.round(d.data[indicators[i]]) + '</span>' +
                                '</div>';
                })).join('</div></div>');
        }

        function buildChart(data) {
            if (!data) {
                return;
            }

            // Munge the data into [month[year:{indicator:value}]]]

            var years = _.keys(data[indicators[0]]);
            var monthKeys = _.keys(data[indicators[0]][years[0]]);
            var min, max;
            vm.chartData = _.map(monthKeys, function (month, monthIndex) {
                return _.map(years, function (year) {
                    var yearData = _.fromPairs(_.map(indicators, function (indicator) {
                        var val = vm.unitConverter(data[indicator][year][month]);
                        if (max === undefined || val > max) {
                            max = val;
                        }
                        if (min === undefined || val < min) {
                            min = val;
                        }
                        return [indicator, val];
                    }));
                    return { year: year, monthIndex: monthIndex, data: yearData };
                });
            });

            // Set various positioning and behavior parameters
            var margin = { top: 10, right: 165, bottom: 15, left: 30 };
            var minMaxHeight = 3;
            var barPadding = 10;
            var monthPadding = 10;
            var yScaleMargin = 10;
            var legendOffset = 15;
            var animationDuration = 1000;
            var animationDelay = 200;

            var svgElement = $element.find('svg').addBack('svg');
            var height = svgElement.height() - margin.top - margin.bottom;
            var width = svgElement.parent().width() - margin.left - margin.right -legendOffset;
            svgElement.width(svgElement.parent().width());

            // Make the scales and axes
            var y = d3.scale.linear()
                .domain([min - yScaleMargin, max + yScaleMargin])
                .range([height - margin.top, 0]);

            var xOuter = d3.scale.ordinal()
                .domain(d3.range(monthKeys.length))
                .rangeRoundBands([0, width], 0.1);

            var xInner = d3.scale.ordinal()
                .domain(years)
                .rangeBands([monthPadding, xOuter.rangeBand() - monthPadding]);

            var xAxis = d3.svg.axis()
                .scale(xOuter)
                .tickFormat(monthNameShort)
                .outerTickSize(0)
                .orient("bottom");

            var xAxisTop = d3.svg.axis()
                .scale(xOuter)
                .tickValues([])
                .outerTickSize(0)
                .innerTickSize(0)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .innerTickSize(-width)
                .outerTickSize(0)
                .ticks(5)
                .orient("left");

            // Initialize tooltips
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(makeTip);

            // Get the svg and attach the tooltips
            var svg = d3.select(svgElement[0]).call(tip);

            // Add the axes to the svg
            svg.append("g").attr("class", "y axis")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(yAxis);
            svg.append("g").attr("class", "x axis")
                .attr("transform", "translate(" + margin.left + "," + height + ")")
                .call(xAxis);
            svg.append("g").attr("class", "x axis top")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(xAxisTop);

            // Create month groups, to be filled with rectangles later
            var month = svg.append("g")
                .attr("width", width)
                .attr("height", height)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .selectAll(".month")
                .data(vm.chartData)
              .enter().append("g")
                .attr("class", "month")
                .attr("transform", function(d, i) { return "translate(" + xOuter(i) + ",0)"; });

            // Add the floating bars for average monthly range
            month.selectAll("rect.avg")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("class", "avg")
                .attr("y", height)
                .attr("height", 0)
                .transition().duration(animationDuration).delay(animationDelay)
                .attr("y", function(d) { return y(d.data.monthly_average_max_temp); })
                .attr("height", function(d) {
                    return y(d.data.monthly_average_min_temp) - y(d.data.monthly_average_max_temp); });

            // Add the monthly min and max bars
            month.selectAll("rect.min")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("class", "min")
                .attr("height", minMaxHeight)
                .attr("y", height)
                .transition().duration(animationDuration).delay(animationDelay)
                .attr("y", function(d) { return y(d.data.monthly_min_temp); });
            month.selectAll("rect.max")
                .data(function(d) { return d; })
              .enter().append("rect")
                .attr("class", "max")
                .attr("height", minMaxHeight)
                .attr("y", height)
                .transition().duration(animationDuration).delay(animationDelay)
                .attr("y", function(d) { return y(d.data.monthly_max_temp); });

            // Add some styles that apply to all the bars
            month.selectAll("rect")
                .attr("x", function(d) { return xInner(d.year); })
                .attr("width", xInner.rangeBand() - barPadding)
                .style("fill", function(d) {return Color.forYear(d.year); })
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            // Side legend
            var legendPlacement = [
                { y: height * 1/4, height: minMaxHeight },
                { y: height * 1/3, height: height * 1/3 },
                { y: height * 2/3, height: 0 },
                { y: height * 3/4, height: minMaxHeight },
            ];
            var legendBars = _.forEach(legendPlacement, function (obj, i) {
                obj.label = dataLabels[i];
            });

            var legend = svg.append("g")
                .attr("class", "legend-side")
                .attr("width", margin.right)
                .attr("height", height)
                .attr("transform", "translate(" + (+width + margin.left + legendOffset) +
                                              "," + margin.top + ")");
            legend.selectAll("rect")
                .data(legendBars)
              .enter().append("rect")
                .attr("width", xInner.rangeBand() - barPadding)
                .attr("y", function (d) { return d.y; })
                .attr("height", function (d) { return d.height; });
            legend.selectAll("text")
                .data(legendBars)
              .enter().append("text")
                .attr("dominant-baseline", "central")
                .attr("class", "legend-item")
                .attr("x", xInner.rangeBand() + barPadding)
                .text(function (d) { return d.label; })
                .attr("y", function (d) { return d.y; });
        }
    }

    /** @ngInject */
    function ccChartMonthlyTemp() {
        var module = {
            restrict: 'A',
            template: '',
            scope: {
                data: '=',
                scenario: '@',
                units: '@',
            },
            controller: 'MonthlyTempChartController',
            controllerAs: 'mtcc',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.charts')
    .controller('MonthlyTempChartController', MonthlyTempChartController)
    .directive('ccChartMonthlyTemp', ccChartMonthlyTemp);

})();