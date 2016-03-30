(function () {
    'use strict';

    /* Draws a chart of monthly values for one or more indicators.
     *
     * The directive must be used on a <canvas> element.
     * @attr type: the type of chart to produce (e.g. 'line', 'bar')
     * @attr data: an object containing scenarios with indicators with years with monthly data
     * @attr options: a config object of the form:
     * {
     *      scenario: 'rcp45', // name of scenario within the 'data' object
     *      chartOptions: {},  // global chart options to pass to Chart.js. Optional.
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
     /*

    /** @ngInject */
    function MonthlyChartController($element, $log, $scope, Color, Units) {

        var CHART_DEFAULTS = {
            scaleStepWidth: 10,
            datasetFill: false,
            multiTooltipTemplate: '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value.toFixed(0) %>'
        };

        function chartSeriesOptions(type, color) {
            switch (type) {
                case 'bar':
                    return {
                        fillColor: color,
                        strokeColor: color,
                        highlightStroke: '#333',
                    };
                case 'line':
                    return {
                        strokeColor: color,
                        pointColor: color,
                        pointStrokeColor: '#333',
                        pointHighlightFill: '#333',
                        pointHighlightStroke: color,
                    };
                default:
                    return {};
            }
        }

        var chart;
        var vm = this;
        initialize();

        function initialize() {
            // Look for canvas on self or descendant
            vm.canvas = $element.find('canvas').addBack('canvas').get(0);
            if (!vm.canvas) {
                throw 'Monthly chart requires canvas element';
            }
            if (!vm.type) {
                throw 'Monthly chart requires the "type" attribute';
            }
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
            if (_.isEmpty(vm.options.chartOptions)) {
                vm.chartOptions = {};
            }

            var chartOptions = angular.extend({}, CHART_DEFAULTS, vm.chartOptions);
            var context = vm.canvas.getContext('2d');
            var data = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                datasets: generateDatasets(newData[vm.options.scenario], vm.options.indicators)
            };
            switch (vm.type) {
                case 'line':
                    chart = new Chart(context).Line(data, chartOptions);
                    break;
                case 'bar':
                    chart = new Chart(context).Bar(data, chartOptions);
                    break;
            }
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
    function ccChartMonthly() {
        var module = {
            restrict: 'A',
            // templateUrl: 'app/components/city/charts/city-chart-monthly.partial.html',
            template: '',
            scope: {
                type: '@',
                data: '=',
                options: '=',
                units: '@'
            },
            controller: 'MonthlyChartController',
            controllerAs: 'mcc',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.charts')
    .controller('MonthlyChartController', MonthlyChartController)
    .directive('ccChartMonthly', ccChartMonthly);

})();
