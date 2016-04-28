(function () {
    'use strict';

    /** @ngInject */
    function YearlyIndicatorController($element, $scope, Color) {
        var vm = this;
        initialize();

        var ROW_HEIGHT = 30;
        var BAR_GAP = 23;
        var LABEL_WIDTH = 40;
        var BAR_LENGTH_FACTOR = 0.8; // How much of the available space should the longest bar fill
        var ANIMATION_DURATION = 1000;
        var ANIMATION_DELAY = 200;

        function initialize() {
            if (!vm.scenario) {
                throw 'Chart requires the "scenario" attribute';
            }
            if (!vm.indicator) {
                throw 'Chart requires the "indicator" attribute';
            }
            if (!vm.label) {
                throw 'Chart requires the "label" attribute';
            }
            if (!vm.infotip) {
                throw 'Chart requires the "infotip" attribute';
            }

            $scope.$watch(function () { return vm.data; }, buildChart);
        }

        function buildChart(data) {
            if (!data || !data[vm.scenario] || !data[vm.scenario][vm.indicator]) {
                return;
            }

            vm.values = _.map(data[vm.scenario][vm.indicator], function (obj, year) {
                return {year: year, value: Math.round(_.values(obj)[0])};
            });

            var width = $element.width();
            var values = _.map(vm.values, 'value');
            var x = d3.scale.linear()
                .domain([d3.min(_.concat(values, 0)), d3.max(values)])
                .range([0, BAR_LENGTH_FACTOR * (width - LABEL_WIDTH)]);

            var chart = d3.select($element[0]).select('svg')
                .attr('width', width)
                .attr('height', ROW_HEIGHT * values.length);

            var bar = chart.selectAll("g")
                    .data(vm.values)
                .enter().append("g")
                    .attr("transform", function(d, i) {
                        return "translate(0," + i * ROW_HEIGHT + ")"; });
            bar.append("text")
                .attr("x", LABEL_WIDTH - 10)
                .attr('text-anchor', 'end')
                .attr("y", ROW_HEIGHT / 2)
                .attr("dy", ".35em")
                .attr("class", "chart-label")
                .text(function(d) { return d.value; });
            bar.append('rect')
                .attr("x", LABEL_WIDTH)
                .attr("y", BAR_GAP / 2)
                .attr("height", ROW_HEIGHT - BAR_GAP)
                .attr('fill', function(d) { return Color.forYear(d.year); })
                .attr('width', 1)
                .transition().duration(ANIMATION_DURATION).delay(ANIMATION_DELAY)
                .attr("width", function(d) { return x(d.value) + 1; });
        }
    }

    /** @ngInject */
    function ccYearlyIndicator() {
        var module = {
            restrict: 'A',
            templateUrl: 'app/components/city/charts/city-card-yearly-indicator.html',
            scope: {
                data: '=',
                scenario: '@',
                indicator: '@',
                label: '@',
                infotip: '@'
            },
            controller: 'YearlyIndicatorController',
            controllerAs: 'yic',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.charts')
    .controller('YearlyIndicatorController', YearlyIndicatorController)
    .directive('ccYearlyIndicator', ccYearlyIndicator);

})();
