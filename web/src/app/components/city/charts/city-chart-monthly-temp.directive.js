(function () {
    'use strict';

    /** @ngInject */
    function MonthlyTempChartController($element, $log, $scope, Units) {

        var CHART_DEFAULTS = {
            scaleStepWidth: 10,
            datasetFill: false,
            multiTooltipTemplate: '<%if (datasetLabel){%><%=datasetLabel%>: <%}%><%= value.toFixed(0) %>'
        };

        var chart;
        var vm = this;
        initialize();

        function initialize() {

            if (!$element.is('canvas')) {
                throw 'Chart requires canvas element';
            }

            if (!vm.scenario) {
                throw 'Chart requires the "scenario" attribute';
            }
            if (!vm.unit) {
                vm.unit = 'c';
            }
            vm.getChart = getChart;

            $scope.$watch(function () { return vm.data; }, onDataChanged);
        }

        function getChart() {
            return chart;
        }

        function onDataChanged(newData) {
            if (_.isEmpty(newData)) {
                $log.error('MonthlyTempChart should not have empty data');
                return;
            }
            if (_.isEmpty(vm.options)) {
                vm.options = {};
            }

            var options = angular.extend({}, CHART_DEFAULTS, vm.options);
            var context = $element.get(0).getContext('2d');
            var data = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                datasets: generateDatasets(newData, vm.scenario)
            };
            chart = new Chart(context).Line(data, options);
        }

        function generateDatasets(data, scenario) {
            var indicators = data[scenario];
            if (_.isEmpty(indicators)) {
                return [];
            }
            var avg_max_temp_data = indicators.monthly_average_max_temp;
            var datasets = _.map(avg_max_temp_data, function (yearData, year) {
                var color = colorForYear(year);
                return {
                    label: 'Avg Monthly Max Temp (' + year + ')',
                    strokeColor: color,
                    pointColor: color,
                    pointStrokeColor: '#333',
                    pointHighlightFill: '#333',
                    pointHighlightStroke: color,
                    data: _(yearData)
                      .toPairs()
                      .sortBy(function (d) { return parseInt(d[0], 10); })
                      .map(function (d) { return convertToUnits(d[1], vm.unit); })
                      .value()
                  };
            });
            datasets.reverse();

            var avg_min_temp_data = indicators.monthly_average_min_temp;
            var minDatasets = _.map(avg_min_temp_data, function (yearData, year) {
                var color = colorForYear(year);
                return {
                    label: 'Avg Monthly Min Temp (' + year + ')',
                    strokeColor: color,
                    pointColor: color,
                    pointStrokeColor: '#333',
                    pointHighlightFill: '#333',
                    pointHighlightStroke: color,
                    data: _(yearData)
                      .toPairs()
                      .sortBy(function (d) { return parseInt(d[0], 10); })
                      .map(function (d) { return convertToUnits(d[1], vm.unit); })
                      .value()
                  };
            });
            minDatasets.reverse();
            return datasets.concat(minDatasets);
        }

        function colorForYear(year) {
            var yearInt = parseInt(year, 10);
            if (yearInt >= 2095) {
                return '#E1354F';
            } else if (yearInt >= 2045) {
                return '#FE6C23';
            } else if (yearInt >= 2000) {
                return '#1A9DEC';
            } else {
                return '#666';
            }
        }

        function convertToUnits(value, unit) {
            var func = angular.noop;
            if (unit.toLowerCase() === 'f') {
                func = Units.kToF;
            } else if (unit.toLowerCase() === 'c')  {
                func = Units.kToC;
            }
            return func(value);
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
                options: '=',
                unit: '@'
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