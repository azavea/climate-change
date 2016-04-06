(function () {
    'use strict';

    /* Makes a legend for an indicator chart, with a label and colored boxes and year labels.
     *
     * Reads years from the given data object and looks up the associated colors.
     *
     * @attr data: an object with years as keys (such as an indicator object)
     * @attr label: the text label for the legend
     /*

    /** @ngInject */
    function ChartLegendController($scope, Color) {
        var vm = this;
        initialize();

        function initialize() {
            $scope.$watch(function () { return vm.data; }, onDataChanged);
        }

        function onDataChanged(data) {
            vm.years = _.map(vm.data, function (val, year) {
                return { year: year, color: Color.forYear(year) };
            });
        }
    }

    /** @ngInject */
    function ccChartLegend() {
        var module = {
            restrict: 'A',
            templateUrl: 'app/components/city/charts/city-chart-legend.partial.html',
            scope: {
                data: '=',
                label: '@'
            },
            controller: 'ChartLegendController',
            controllerAs: 'ctl',
            bindToController: true
        };
        return module;
    }

    angular.module('cc.city.charts')
    .controller('ChartLegendController', ChartLegendController)
    .directive('ccChartLegend', ccChartLegend);

})();
